export const json = {
    "title": "Forum@work Survey Question",
    "elements": [
      {
        "type": "rating",
        "name": "survey-score",
        "title": "On a scale from 0 to 10, how likely are you to recommend us to a friend or colleague?",
        "rateMin": 0,
        "rateMax": 10,
        "minRateDescription": "Very unlikely",
        "maxRateDescription": "Very likely"
      },
      {
        "type": "comment",
        "name": "disappointing-experience",
        "visibleIf": "{survey-score} <= 5",
        "title": "How did we disappoint you and what can we do to make things right?",
        "maxLength": 300
      },
      {
        "type": "comment",
        "name": "improvements-required",
        "visibleIf": "{survey-score} >= 6",
        "title": "What can we do to make your experience more satisfying?",
        "maxLength": 300
      },
      {
        "type": "checkbox",
        "name": "app-features",
        "visibleIf": "{survey-score} >= 9",
        "title": "Which of the following features do you value the most?",
        "description": "Please select no more than three features.",
        "isRequired": true,
        "choices": [
          {
            "value": "performance",
            "text": "Performance"
          },
          {
            "value": "stability",
            "text": "Stability"
          },
          {
            "value": "ui",
            "text": "User interface"
          },
          {
            "value": "complete-functionality",
            "text": "Complete functionality"
          },
          {
            "value": "learning-materials",
            "text": "Learning materials (documentation, demos, code examples)"
          },
          {
            "value": "support",
            "text": "Quality support"
          }
        ],
        "showOtherItem": true,
        "otherPlaceholder": "Please specify...",
        "otherText": "Other features",
        "colCount": 2,
        "maxSelectedChoices": 3
      }
    ],
    "showQuestionNumbers": false
  };


// export const json = {
//   "name": "Forum Prep",
//   "elements": [
//     {
//       "type": "comment",
//       "name": "what_is_your_name?1722515437266",
//       "title": "What is your name?",
//     },
//     {
//       "type": "radiogroup",
//       "name": "where_you_are_living?1722515774975",
//       "title": "Where you are living?",
//       "choices": [
//         {
//           "orderNo":"A",
//           "value": "1",
//           "text": "House",
//           "set_correct":true
//         },
//         {
//           "orderNo":"B",
//           "value": "2",
//           "text": "Apartment",
//           "set_correct":false
//         },
//         {
//           "orderNo":"C",
//           "value": "3",
//           "text": "Hotel",
//           "set_correct":false
//         },
//         {
//           "orderNo":"D",
//           "value": "4",
//           "text": "PG",
//           "set_correct":false
//         },
//       ],
//       "correctAnswer": "House"
//     },

//   ]

// }