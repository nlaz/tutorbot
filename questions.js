exports.questions = {
    calculus_ab: [
        {
            type: 'generic',
            title: 'Solve for \'h\' above',
            subtitle: 'Select the best answer below:',
            image_path: 'images/calc_1.jpg',
            options: ['1', 'sqrt(2)/2', '0', '-1', 'The limit doesn\'t exist.'],
            payloads: ['A=>CALC=> 1', 'N=> sqrt(2)/2', 'N=> 0', 'N=> -1', 'N=> The limit doesn\'t exist.' ]
        },
        {
            type: 'generic',
            title: 'Select the best answer below:',
            subtitle: 'What is the slope of the tangent to the curve above at (2,1)?',
            image_path: 'images/calc_2.jpg',
            options: ['-3/2', '-1', '-5/14', '-3/14', '0'],
            payloads: ['N=> -3/2', 'N=> -1', 'A=>CALC=> -5/14', 'N=> -3/14', 'N=> 0']
        },
        {
            type: 'generic',
            title: 'Given the function f, then what is f\'(0)?',
            image_path: 'images/calc_3.jpg',
            subtitle: 'Select the best answer below:',
            options: ['-2cos(3)', '-2sin(3)cos(3)', '6cos(3)', '2sin(3)cos(3)', '6sin(3)cos(3)'],
            payloads: ['N=> -2cos(3)', 'A=>CALC=> -2sin(3)cos(3)', 'N=> 6cos(3)', 'N=> 2sin(3)cose(3)', 'N=> 6sin(3)cos(3)']
        },
        {
            type: 'generic',
            title: 'What is the area of the shaded region?',
            image_path: 'images/calc_4.jpg',
            subtitle: 'The graph above shows the area of y = 5x - x^2 and the line of y = 2x. Select the best answer below:',
            options: ['25/6', '9/2', '9', '27/2', '45/2'],
            payloads: ['N=> 25/6', 'A=>CALC=> 9/2', 'N=> 9', 'N=> 27/2', 'N=> 45/2']
        },
        {
            type: 'generic',
            title: 'The graph of a function f is shown above.',
            image_path: 'images/calc_5.jpg',
            subtitle: 'If lim x->b f(x) exists and f is not continuous at b, what is b?',
            options: ['-1', '0', '1', '2', '3'],
            payloads: ['N=> -1', 'A=>CALC=> 0', 'N=> 1', 'N=> 2', 'N=> 3']
        },
        {
            type: 'generic',
            title: 'Given the function f given above.',
            image_path: 'images/calc_6.jpg',
            subtitle: 'Find the average rate of change on the closed interval [0,3].',
            options: ['8.5', '8.7', '22', '33', '66'],
            payloads: ['N=> 8.5', 'N=> 8.7', 'A=>CALC=> 22', 'N=> 33', 'N=> 66']
        },
        {
            type: 'generic',
            title: 'Solve the equation above.',
            image_path: 'images/calc_7.jpg',
            subtitle: 'Select the best answer below:',
            options: ['-2', '-1/4', '1/2', '1', 'The limit doesn\'t exist'],
            payloads: ['N=> -2', 'A=>CALC=> -1/4', 'N=> 1/2', 'N=> 1', 'N=> The limit doesn\'t exist']
        },
        {
            type: 'generic',
            title: 'If f(0) = 1, then what is f(2)?',
            image_path: 'images/calc_8.jpg',
            subtitle: 'Select the best answer below:',
            options: ['-1.819', '-0.843', '-0.819', '0.157', '1.157'],
            payloads: ['N=> -1.819', 'N=> -0.843', 'N=> -0.819', 'N=> 0.157', 'A=>CALC=> 1.157']
        }
    ],
    human_geo: [
        {
            type: 'button',
            text: 'Which of the following regions has little dairying in its traditional agriculture?',
            options: ['Eastern Europe', 'Western Europe', 'South Asia', 'East Asia', 'North America'],
            payloads: ['N=> Eastern Europe', 'N=> Western Europe', 'N=> South Asia', 'A=>GEO=> East Asia', 'N=> North America']
        }, 
        {   
            type: 'generic',
            title: 'Use the map above to answer: ',
            image_path: 'images/geo_2.jpg',
            subtitle: 'Which one of the boxes is in an area with high population density and low economic development?',
            options: ['A', 'B', 'C', 'D', 'E'],
            payloads: ['N=> A', 'N=> B', 'A=>GEO=> C', 'N=> D', 'N=> E']
        },
        {
            type: 'button',
            text: 'Which of the following is a subsistence crop?',
            options: ['Corn', 'Cotton', 'Rubber', 'Cocoa', 'Timber'],
            payloads: ['A=>GEO=> Corn', 'N=> Cotton', 'N=> Rubber', 'N=> Cocoa', 'N=> Timber']
        },
        {
            type: 'button',
            text: 'Which of the following originated in South Asia and subsequently spread throughout much of Southeast and East Asia?',
            options: ['Hinduism', 'Christianity', 'Buddhism', 'Sikhism', 'Confucianism'],
            payloads: ['N=> Hinduism', 'N=> Christianity', 'A=>GEO=> Buddhism', 'N=> Sikhism', 'N=> Confucianism']
        }
    ]
}