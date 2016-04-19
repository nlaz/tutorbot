/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Facebook bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Facebook's Messenger APIs
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Follow the instructions here to set up your Facebook app and page:

    -> https://developers.facebook.com/docs/messenger-platform/implementation

  Run your bot from the command line:

    page_token=<MY PAGE TOKEN> verify_token=<MY_VERIFY_TOKEN> node facebook_bot.js

  Use localtunnel.me to make your bot available on the web:

    lt --port 3000

# USE THE BOT:

  Find your bot inside Facebook to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if(!process.env.page_token || !process.env.verify_token) {
  var env = require('./env.js')
}

var questions = require('./questions.js').questions;
var Botkit = require('./lib/Botkit.js');
var os = require('os');
var usage = "I'm Quizbot! Your quiz assistant. Here are my options:\n\nmath - Try some math quizzes.\nenglish - Try some english quizzes.";
var difficulty = 'EASY';
var base_url = 'http://nlaz.xyz/quizbot/';


var controller = Botkit.facebookbot({
    debug: true,
    access_token: process.env.page_token,
    verify_token: process.env.verify_token,
});

var bot = controller.spawn({
});

controller.setupWebserver(process.env.port || 3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('ONLINE!');
    });
});


controller.hears(['hello', 'hi'], 'message_received', function(bot, message) {

    bot.reply(message, {
        'attachment': {
            'type': 'template',
            'payload': { 
                'template_type': 'generic',
                'elements': [{
                    'title': 'HI! I\'m QuizBot! Nice to meet you!',
                    'image_url': base_url + 'images/bot.jpg',
                    'subtitle': 'Select \'Usage\' to see what I can do or \'Quiz\' to get started.',
                    'buttons': [
                        {
                            'type': 'postback',
                            'title': 'View Usage',
                            'payload': 'OPTIONS_USAGE'
                        },
                        {
                            'type': 'postback',
                            'title': 'Start Quiz',
                            'payload': 'OPTIONS_QUIZ'
                        }
                    ]
                }]
            }
        }
    });
});

controller.hears(['stats', 'Stats'], 'message_received', function(bot, message) {

  //TODO Add stats feature
  bot.reply(message, 'Whoops! I don`t have that feature yet');

});

controller.hears(['quiz me', 'Quiz', 'Quiz me'], 'message_received', function(bot, message) {

    bot.reply(message, {
        attachment: {
            'type': 'template',
            'payload': {
                'template_type': 'button',
                'text': 'Quiz Time! Select a category:',
                'buttons': [
                    {
                        'type': 'postback',
                        'title': 'AB Calculus',
                        'payload': 'SUBJECT_AB_CALCULUS'
                    },
                    {
                        'type': 'postback',
                        'title': 'Human Geo',
                        'payload': 'SUBJECT_HUMAN_GEO'
                    },
                    {
                        'type': 'postback',
                        'title': 'US. History',
                        'payload': 'SUBJECT_US_HISTORY'
                    }
                ]
            }
        }
    });
});

var launchQuiz = function(message, question) {

    var buttons = [];

    for (var i = 0; i < question.options.length; i++) {
        buttons.push({
            'type': 'postback',
            'title': question['options'][i],
            'payload': question['payloads'][i]
        });
    }

    buttons.push({
        'type': 'postback',
        'title': 'I don\'t know.',
        'payload': 'NO_CLUE'
    });

    var attachment_template = {
        'attachment': {
            'type': 'template',
            'payload': { 'template_type': question['type'] }
        }
    };

    if (question['type'] == 'button') {
        attachment_template['attachment']['payload']['buttons'] = buttons.slice(0,3);
        attachment_template['attachment']['payload']['text'] = question['text'];
    } else if (question['type'] == 'generic') {
        attachment_template['attachment']['payload']['elements'] = [
            {
                'title': question['title'],
                'image_url': question['image_url'],
                'subtitle': question['subtitle'],
                'buttons': buttons.slice(0,3)
            }
        ]
    }

    console.log(attachment_template);
    bot.reply(message, attachment_template);

    // Overflow Options
    setTimeout( function(){ bot.reply(message, {
        attachment: {
            'type': 'template',
            'payload': {
                'text': ' ',
                'template_type': 'button',
                'buttons': buttons.slice(3)
            }
        }
    } )}, 300);
}

var nextQuestion = function(message, subject) {
    var buttons = [
        {
            'type': 'postback',
            'title': 'Next One',
            'payload': 'OPTIONS_NEXT_' + subject,
        },
        {
            'type': 'postback',
            'title': 'Stop',
            'payload': 'OPTIONS_STOP',
        }
    ];

    setTimeout( function(){ bot.reply(message, {
        attachment: {
            'type': 'template',
            'payload': {
                'text': ' ',
                'template_type': 'button',
                'buttons': buttons
            }
        }
    } )}, 1000);
}

var numQuestions = 0;
var numMissed = 0;
var numCorrect = 0;

controller.on('facebook_postback', function(bot, message) {
    var answer = message.payload,
        subject;
    switch(answer){
        case 'OPTIONS_QUIZ':
        case 'SUBJECT_AB_CALCULUS':
            bot.reply(message, 'Starting AB Calculus quiz!');
            message['subject'] = answer;
            numQuestions = 1;
            launchQuiz(message, generateCalculusQuestion());
            break;
        case 'SUBJECT_HUMAN_GEO':
            bot.reply(message, 'Starting Human Geography quiz!');
            message['subject'] = answer;
            console.log(message);
            numQuestions = 1;
            launchQuiz(message, generateHumanGeoQuestion());
            break;
        case 'SUBJECT_US_HISTORY':
            message['subject'] = answer;
            bot.reply(message, 'No US. History at the moment...');
            break;
        case (answer.match(/^A=>/) || {}).input:
            answer = answer.replace('A=>', '');
            if (answer.includes('GEO=>')) {
                answer = answer.replace('GEO=> ', '');
                subject = 'SUBJECT_HUMAN_GEO';
            } else if (answer.includes('CALC=>')) {
                answer = answer.replace('CALC=> ', '');
                subject = 'SUBJECT_AB_CALCULUS';
            }
            bot.reply(message, 'That\'s right! ' + answer + ' is the answer.');
            numCorrect++;
            nextQuestion(message, subject );
            break;
        case (answer.match(/^N=> /) || {}).input:
            answer = answer.replace('N=> ', '');
            bot.reply(message, 'Not quite. Try again.');
            numMissed++;
            break;
        case 'NO_CLUE':
            bot.reply(message, 'No worries. We will come back to that one.');
            nextQuestion(message);
            break;
        case 'OPTIONS_NEXT_SUBJECT_AB_CALCULUS':
            bot.reply(message, 'Here\'s another one...');
            numQuestions++;
            launchQuiz(message, generateCalculusQuestion());
            break;
        case 'OPTIONS_NEXT_SUBJECT_HUMAN_GEO':
            bot.reply(message, 'Here\'s another one...');
            numQuestions++;
            launchQuiz(message, generateHumanGeoQuestion());
            break;
        case 'OPTIONS_STOP':
            bot.reply(message, 'Nice! You got ' + numCorrect + ' out of ' + numQuestions + ' questions right!');
            break;
        case 'OPTIONS_USAGE':
            bot.reply(message, usage);
            break;
        default:
            bot.reply(message, 'Whoops! What happened?');
            break;
    }

});

controller.hears(['Calculus', 'calculus'], 'message_received', function(bot, message) {
    bot.reply(message, 'Starting AB Calculus quiz!');
    launchQuiz(message, generateCalculusQuestion());
});

controller.hears(['Human Geo', 'human geo', 'geo'], 'message_received', function(bot, message) {
    bot.reply(message, 'Starting Human Geography quiz!');
    launchQuiz(message, generateHumanGeoQuestion());
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'message_received', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['help', 'usage'], 'message_received', function(bot, message) {

    bot.reply(message, usage);

});

controller.hears(['math'], 'message_received', function(bot, message) {
    askMathQuestion = function(response, convo) {
        var math = generateMath();
        console.log(math);
        if (math) {
            convo.ask(math['question'], function(response, convo) {
              var answer = math['answer'];
              console.log(response.text + " =? " + answer);
              console.log(response.text == answer);
              switch(response.text) {
                case String(answer):
                  bot.reply(response,'Nice! That\'s right!');
                  convo.stop();
                  break;
                case 'stop':
                  bot.reply(response,'Ok. We can come back to that.');
                  convo.stop();
                  break;
                default:
                  bot.reply(response, 'Whoops! Try again or type \'stop\'.');
                  break;
              }
            });
        }
    }
    bot.startConversation(message, askMathQuestion);
});

controller.hears(['what is my name', 'who am i'], 'message_received', function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});

controller.hears(['shutdown'], 'message_received', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});

controller.on('message_received', function(bot, message) {
    bot.reply(message, 'Oops! I didn`t catch that. Try:\n' + usage);
    return false;
});


function generateMath() {
    var ops = ['/','*','-','+'],
        DIFFLIM = 12,
        left, right, operator, equation;
    switch (difficulty) {
        case 'EASY':
          DIFFLIM = 12;
          break;
        case 'HARD':
          DIFFLIM = 24;
          break;
        default:
          console.log("Oy vey");
          return;
    }

    left = randomInt(1, DIFFLIM);
    right = randomInt(1, DIFFLIM);
    operator = ops[randomInt(0, ops.length)];
    equation = left + operator + right;
    console.log(equation);
    return {
        question: equation + "= ?",
        answer: eval(equation)
    }
}

function generateHumanGeoQuestion() {
  return generateQuestion('human_geo');
}

function generateCalculusQuestion() {
  return generateQuestion('calculus_ab');
}

function generateQuestion(subject) {
  var topic = questions[subject],
      question = topic[Math.floor(Math.random()*topic.length)];

  shuffle(question['options'], question['payloads']);

  return {
      type: question['type'],
      text: question['text'],
      title: question['title'],
      image_url: base_url + question['image_path'],
      subtitle: question['subtitle'],
      options: question['options'],
      payloads: question['payloads']
  }
}

function randomInt(xmin,xmax) { 
    return Math.floor( Math.random() * (xmax + 1 - xmin) + xmin ); 
}

function shuffle(obj1, obj2) {
    var l = obj1.length,
        i = 0, rnd, tmp1, tmp2;

    while (i < l) {
        rnd = Math.floor(Math.random() * i);
        tmp1 = obj1[i];
        tmp2 = obj2[i];
        obj1[i] = obj1[rnd];
        obj2[i] = obj2[rnd];
        obj1[rnd] = tmp1;
        obj2[rnd] = tmp2;
        i += 1;
    }
}
