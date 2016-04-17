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

var QUESTIONS = {
    calculus_ab: [
        {
            type: 'generic',
            title: 'Solve for \'h\' above',
            subtitle: 'Select the best answer below:',
            image_path: 'images/calc_1.jpg',
            options: ['1', 'sqrt(2)/2', '0', '-1', 'The limit does\'nt exist.'],
            payloads: ['A=> 1', 'N=> sqrt(2)/2', 'N=> 0', 'N=> -1', 'N=> The limit doesn\'t exist.' ]
        },
        {
            type: 'generic',
            title: 'What is the slope of the tangent to the curve above at (2,1)?',
            subtitle: 'Select the best answer below:',
            image_path: 'images/calc_2.jpg',
            options: ['-3/2', '-1', '-5/14', '-3/14', '0'],
            payloads: ['N=> -3/2', 'N=> -1', 'A=> -5/14', 'N=> -3/14', 'N=> 0']
        },
        {
            type: 'generic',
            title: 'Given the function f, then what is f\'(0)?',
            image_path: 'images/calc_3.jpg',
            subtitle: 'Select the best answer below:',
            options: ['-2cos(3)', '-2sin(3)cos(3)', '6cos(3)', '2sin(3)cose(3)', '6sin(3)cos(3)'],
            payloads: ['N=> -2cos(3)', 'A=> -2sin(3)cos(3)', 'N=> 6cos(3)', 'N=> 2sin(3)cose(3)', 'N=> 6sin(3)cos(3)']
        },
        {
            type: 'generic',
            title: 'What is the area of the shaded region?',
            image_path: 'images/calc_4.jpg',
            subtitle: 'The graph above shows the area of y = 5x - x^2 and the line of y = 2x. Select the best answer below:',
            options: ['25/6', '9/2', '9', '27/2', '45/2'],
            payloads: ['N=> 25/6', 'A=> 9/2', 'N=> 9', 'N=> 27/2', 'N=> 45/2']
        },
        {
            type: 'generic',
            title: 'The graph of a function f is shown above.',
            image_path: 'images/calc_5.jpg',
            subtitle: 'If lim x->b f(x) exists and f is not continuous at b, b =',
            options: ['-1', '0', '1', '2', '3'],
            payloads: ['N=> -1', 'A=> 0', 'N=> 1', 'N=> 2', 'N=> 3']
        },
        {
            type: 'generic',
            title: 'Given the function f given above.',
            image_path: 'images/calc_6.jpg',
            subtitle: 'Find the average rate of change on the closed interval [0,3].',
            options: ['8.5', '8.7', '22', '33', '66'],
            payloads: ['N=> 8.5', 'N=> 8.7', 'A=> 22', 'N=> 33', 'N=> 66']
        },
        {
            type: 'generic',
            title: 'Solve the equation above.',
            image_path: 'images/calc_7.jpg',
            subtitle: 'Select the best answer below:',
            options: ['-2', '-1/4', '1/2', '1', 'The limit doesn\'t exist'],
            payloads: ['N=> -2', 'A=> -1/4', 'N=> 1/2', 'N=> 1', 'N=> The limit doesn\'t exist']
        },
        {
            type: 'generic',
            title: 'If f(0) = 1, then f(2) =',
            image_path: 'images/calc_8.jpg',
            subtitle: 'Select the best answer below:',
            options: ['-1.819', '-0.843', '-0.819', '0.157', '1.157'],
            payloads: ['N=> -1.819', 'N=> -0.843', 'N=> -0.819', 'N=> 0.157', 'A=> 1.157']
        }
    ],
    human_geo: [
        {
            type: 'button',
            text: 'Which of the following regions has little dairying in its traditional agriculture?',
            options: ['Eastern Europe', 'Western Europe', 'South Asia', 'East Asia', 'North America'],
            payloads: ['N=> Eastern Europe', 'N=> Western Europe', 'N=> South Asia', 'A=> East Asia', 'N=> North America']
        }, 
        {   
            type: 'generic',
            title: 'Use the map above to answer: ',
            image_path: 'images/geo_2.jpg',
            subtitle: 'Which one of the boxes is in an area with high population density and low economic development?',
            options: ['A', 'B', 'C', 'D', 'E'],
            payloads: ['N=> A', 'N=> B', 'A=> C', 'N=> D', 'N=> E']
        },
        {
            type: 'button',
            text: 'Which of the following is a subsistence crop?',
            options: ['Corn', 'Cotton', 'Rubber', 'Cocoa', 'Timber'],
            payloads: ['A=> Corn', 'N=> Cotton', 'N=> Rubber', 'N=> Cocoa', 'N=> Timber']
        },
        {
            type: 'button',
            text: 'Which of the following originated in South Asia and subsequently spread throughout much of Southeast and East Asia?',
            options: ['Hinduism', 'Christianity', 'Buddhism', 'Sikhism', 'Confucianism'],
            payloads: ['N=> Hinduism', 'N=> Christianity', 'A=> Buddhism', 'N=> Sikhism', 'N=> Confucianism']
        }
    ]
}

if (!process.env.page_token) {
    console.log('Error: Specify page_token in environment');
    process.exit(1);
}

if (!process.env.verify_token) {
    console.log('Error: Specify verify_token in environment');
    process.exit(1);
}


var Botkit = require('./lib/Botkit.js');
var os = require('os');
var usage = "I'm Quizbot! Your quiz assistant. Here are my options:\n\nmath - Try some math quizzes.\nenglish - Try some english quizzes.";
var difficulty = 'EASY';

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


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['quiz me'], 'message_received', function(bot, message) {

    bot.reply(message, {
        attachment: {
            'type': 'template',
            'payload': {
                'template_type': 'button',
                'text': 'Quiz Time! Select a category:',
                'buttons': [
                    {
                        'type': 'postback',
                        'title': 'AB CALCULUS',
                        'payload': 'Subject: AB CALCULUS'
                    },
                    {
                        'type': 'postback',
                        'title': 'HUMAN GEO',
                        'payload': 'Subject: HUMAN GEO'
                    },
                    {
                        'type': 'postback',
                        'title': 'US. HISTORY',
                        'payload': 'Subject: US. HISTORY'
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

    console.log(question['type'] + "  <!!!!!");
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
                'text': 'more options...',
                'template_type': 'button',
                'buttons': buttons.slice(3)
            }
        }
    } )}, 300);
}

controller.on('facebook_postback', function(bot, message) {
    var answer = message.payload;
    switch(answer){
        case 'Subject: AB CALCULUS':
            bot.reply(message, 'Starting AB Calculus quiz!');
            launchQuiz(message, generateCalculusQuestion());
            break;
        case 'Subject: HUMAN GEO':
            bot.reply(message, 'Starting Human Geography quiz!');
            launchQuiz(message, generateHumanGeoQuestion());
            break;
        case 'Subject: US. HISTORY':
            bot.reply(message, 'No US. History at the moment...');
            break;
        case (answer.match(/^A=> /) || {}).input:
            answer = answer.replace('A=> ', '');
            bot.reply(message, 'That\'s right! ' + answer + ' is the answer.');
            break;
        case (answer.match(/^N=> /) || {}).input:
            answer = answer.replace('N=> ', '');
            bot.reply(message, 'Not quite. Try again.');
            break;
        default:
            bot.reply(message, 'Whoops! What happened?');
            break;
    }

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
    questionCount = 0;
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


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], 'message_received',
    function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');
});

controller.on('message_received', function(bot, message) {
    bot.reply(message, 'Try: `what is my name` or `structured` or `call me captain`');
    return false;
});


function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

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
  var base_url = 'http://nlaz.xyz/quizbot/',
      qset = QUESTIONS[subject],
      question = qset[randomInt(0, qset.length)];

      console.log(question);
      shuffle(question['options'], question['payloads']);

    return {
        type: question['type'],
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
