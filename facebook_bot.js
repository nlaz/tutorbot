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
                'template_type': 'generic',
                'elements': [
                    {
                        'title': 'Quiz Time! Select a category:',
                        'buttons': [
                            {
                                'type': 'postback',
                                'title': 'AB CALCULUS',
                                'payload': 'Subject: AB CALCULUS'
                            },
                            {
                                'type': 'postback',
                                'title': 'BC CALCULUS',
                                'payload': 'Subject: BC CALCULUS'
                            },
                            {
                                'type': 'postback',
                                'title': 'US. HISTORY',
                                'payload': 'Subject: US. HISTORY'
                            }
                        ]
                    }
                ]
            }
        }
    });
});

var launchCalculusQuiz = function(message, question) {

    var buttons = [];

    for (var i = 0; i < question.options.length; i++) {
        buttons.push({
            'type': 'postback',
            'title': question['options'][i],
            'payload': 'Answer: ' + question['options'][i]
        });
    }

    bot.reply(message, {
        attachment: {
            'type': 'template',
            'payload': {
                'template_type': 'generic',
                'elements': [
                    {
                        'title': question['title'],
                        'image_url': question['image_url'],
                        'subtitle': question['subtitle'],
                        'buttons': buttons.slice(0,3)
                    }
                ]
            }
        }
    });

    // Overflow Options
    bot.reply(message, {
        attachment: {
            'type': 'template',
            'payload': {
                'template_type': 'generic',
                'elements': [
                    {
                        'title': 'Continued...',
                        'buttons': buttons.slice(3)
                    }
                ]
            }
        }
    });
}

controller.on('facebook_postback', function(bot, message) {
    var answer = message.payload;
    switch(answer){
        case 'Subject: AB CALCULUS':
            bot.reply(message, 'Starting AB Calculus quiz!');
            launchCalculusQuiz(message, generateCalculusQuestion());
            break;
        case 'Subject: BC CALCULUS':
            bot.reply(message, 'No BC Calculus quizzes at the moment...');
            break;
        case 'Subject: US. HISTORY':
            bot.reply(message, 'No US. History at the moment...');
            break;
        case (answer.match(/^Answer:/) || {}).input:
            answer = answer.replace("Answer: ", "");
            bot.reply(message, 'Is ' + answer + ' your final answer?');
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

function generateCalculusQuestion() {
  var base_url = 'http://nlaz.xyz/quizbot/';
  var title = 'Solve for \'h\' above',
      subtitle = 'Select the best answer',
      image_path = 'images/calc_1.jpg',
      answer = '1',
      options = ['1', 'sqrt(2)/2', '0', '-1', 'The limit does not exist.'];

    return {
        title: title,
        image_url: base_url + image_path,
        subtitle: subtitle,
        answer: answer,
        options: options
    }
}

function randomInt(xmin,xmax) { 
    return Math.floor( Math.random() * (xmax + 1 - xmin) + xmin ); 
}
