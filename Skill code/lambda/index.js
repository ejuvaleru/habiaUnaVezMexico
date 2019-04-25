// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

// Arreglo de Datos curiosos

const listaDatos = [
    '',
    ];

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speechText = 'Bienvenido, puedes pedirme un dato curioso o podemos poner a prueba tus conocimientos jugando. ¿Qué te gustaría hacer?';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
             .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./welcome.json'),
                datasources: {}
            })
            .getResponse();
    }
};
const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'HolaMundoIntent';
    },
    handle(handlerInput) {
        const speechText = 'Hola Mundo!';
        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

//Handler de Datos curiosos

const DatoCuriosoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'DatoCuriosoIntent';
    },
    handle(handlerInput) {
        //Arreglo de id's 
        let idDatosCuriosos = [];
        
        
        //Arreglo de Anexos
        const listaAnexos = [
            '¿Sabías qué?...',
            'A que no te imaginabas que... ',
            'Esto te va a sorprender... ',
            'Te voy a hacer más sabiondo... ',
            'Aprendamos esto juntos... '
        ];
        
        //Indice del Anexo
        const indAleatorio = Math.floor(Math.random() * listaAnexos.length);
        const anexoAleatorio = listaAnexos[indAleatorio];
        //Datos del Json de datosCuriosos.json
        const listaDatosCuriosos = require('./datosCuriosos.json');
        
        //Indice para los Datos Curiosos
        const indiceAleatorio = Math.floor(Math.random() * listaDatosCuriosos.datosCuriosos.length);
        //Dato curioso
        const datoCuriosoAleatorio = listaDatosCuriosos.datosCuriosos[indiceAleatorio];
        
        //Array de speechOutput
        const listaSpeechcon = [
            '...<say-as interpret-as="interjection">wórales</say-as>.',
            '...<say-as interpret-as="interjection">chido</say-as>.',
            '...<say-as interpret-as="interjection">fabuloso</say-as>.'
            ]
            //Índice para speechconAleatorio
        const inAleatorio = Math.floor(Math.random() * listaSpeechcon.length);
        //speechconAleatorio
        const speechconAleatorio = listaSpeechcon[inAleatorio];
        
        //Respuesta de Alexa
        const speechOutput = anexoAleatorio + datoCuriosoAleatorio.dato + speechconAleatorio;

        //Arreglo de prompts
        const prompts = [
            "Veo que te gusta aprender",
            "Esto es divertido",
            "¿Seguimos investigando?",
            "Me gusta que te interese tanto",
            "Que bien que te guste la Historia"];
            
         //Indice para los Datos prompts
        const iAleatorio = Math.floor(Math.random() * prompts.length);
        //Dato curioso
        const promptAleatorio = prompts[iAleatorio];
        
        return handlerInput.responseBuilder
            .speak(`${speechOutput}... ${promptAleatorio}... ¿quieres intentar otra cosa?`)
            .reprompt('Veo que te gusta aprender ¿quieres intentar otra cosa?')
             .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./main.json'),
                datasources: {
                    "bodyTemplate7Data": {
                        "type": "object",
                        "objectId": "bt7Sample",
                        "title": "Dato Curioso",
                        "image": {
                            "sources": [
                            {
                                "url": datoCuriosoAleatorio.urlImage,
                                "size": "small",
                                "widthPixels": 0,
                                "heightPixels": 0
                            },
                            ]
                        },
                        "logoUrl": "",
                    }
                }
            })
            .getResponse();
    }
};

//TRIVIA HANDLER

const QuizHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log("Inside QuizHandler");
    console.log(JSON.stringify(request));
    return request.type === "IntentRequest" &&
           (request.intent.name === "QuizIntent" || request.intent.name === "AMAZON.StartOverIntent");
  },
  handle(handlerInput) {
    console.log("Inside QuizHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;
    attributes.state = states.QUIZ;
    attributes.counter = 0;
    attributes.quizScore = 0;

    var question = askQuestion(handlerInput);
    var speakOutput = startQuizMessage + question;
    var repromptOutput = question;

    const item = attributes.quizItem;
    const property = attributes.quizProperty;

    if (supportsDisplay(handlerInput)) {
      const title = `Pregunta #${attributes.counter}`;
      const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(getQuestionWithoutOrdinal(property, item)).getTextContent();
      const backgroundImage = new Alexa.ImageHelper().addImageInstance(getBackgroundImage(attributes.quizItem.Abbreviation)).getImage();
      const itemList = [];
      getAndShuffleMultipleChoiceAnswers(attributes.selectedItemIndex, item, property).forEach((x, i) => {
        itemList.push(
          {
            "token" : x,
            "textContent" : new Alexa.PlainTextContentHelper().withPrimaryText(x).getTextContent(),
          }
        );
      });
      response.addRenderTemplateDirective({
        type : 'ListTemplate1',
        token : 'Question',
        backButton : 'hidden',
        backgroundImage,
        title,
        listItems : itemList,
      });
    }

    return response.speak(speakOutput)
                   .reprompt(repromptOutput)
                   .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./main.json'),
                datasources: {
                    "bodyTemplate7Data": {
                        "type": "object",
                        "objectId": "bt7Sample",
                        "title": "Pregunta",
                        "image": {
                            "sources": [
                            {
                                "url": "https://cdn.pixabay.com/photo/2014/09/03/07/59/question-mark-434153_960_720.png",
                                "size": "small",
                                "widthPixels": 0,
                                "heightPixels": 0
                            },
                            ]
                        },
                        "logoUrl": "",
                    }
                }
            }).getResponse();
  },
};



const QuizAnswerHandler = {
  canHandle(handlerInput) {
    console.log("Inside QuizAnswerHandler");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const request = handlerInput.requestEnvelope.request;

    return attributes.state === states.QUIZ &&
           request.type === 'IntentRequest' &&
           request.intent.name === 'AnswerIntent';
  },
  handle(handlerInput) {
    console.log("Inside QuizAnswerHandler - handle");
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const response = handlerInput.responseBuilder;

    var speakOutput = ``;
    var repromptOutput = ``;
    const item = attributes.quizItem;
    const property = attributes.quizProperty;
    const isCorrect = compareSlots(handlerInput.requestEnvelope.request.intent.slots, item[property]);

    if (isCorrect) {
      speakOutput = getSpeechCon(true);
      attributes.quizScore += 1;
      handlerInput.attributesManager.setSessionAttributes(attributes);
    } else {
      speakOutput = getSpeechCon(false);
    }

    speakOutput += getAnswer(property, item);
    var question = ``;
    //IF YOUR QUESTION COUNT IS LESS THAN 10, WE NEED TO ASK ANOTHER QUESTION.
    if (attributes.counter < 10) {
      speakOutput += getCurrentScore(attributes.quizScore, attributes.counter);
      question = askQuestion(handlerInput);
      speakOutput += question;
      repromptOutput = question;

      if (supportsDisplay(handlerInput)) {
        const title = `Question #${attributes.counter}`;
        const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(getQuestionWithoutOrdinal(attributes.quizProperty, attributes.quizItem)).getTextContent();
        const backgroundImage = new Alexa.ImageHelper().addImageInstance(getBackgroundImage(attributes.quizItem.Abbreviation)).getImage();
        const itemList = [];
        getAndShuffleMultipleChoiceAnswers(attributes.selectedItemIndex, attributes.quizItem, attributes.quizProperty).forEach((x, i) => {
          itemList.push(
            {
              "token" : x,
              "textContent" : new Alexa.PlainTextContentHelper().withPrimaryText(x).getTextContent(),
            }
          );
        });
        response.addRenderTemplateDirective({
          type : 'ListTemplate1',
          token : 'Question',
          backButton : 'hidden',
          backgroundImage,
          title,
          listItems : itemList,
        });
      }
      return response.speak(speakOutput)
      .reprompt(repromptOutput)
      .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./main.json'),
                datasources: {
                    "bodyTemplate7Data": {
                        "type": "object",
                        "objectId": "bt7Sample",
                        "title": " Respuesta",
                        "image": {
                            "sources": [
                            {
                                "url": "https://images.emojiterra.com/twitter/v12/512px/1f914.png",
                                "widthPixels": 0,
                                "heightPixels": 0
                            },
                            ]
                        },
                        "logoUrl": "",
                    }
                }
            })
      .getResponse();
    }
    else {
      speakOutput += getFinalScore(attributes.quizScore, attributes.counter) + exitSkillMessage;
      if(supportsDisplay(handlerInput)) {
        const title = 'Gracias por jugar';
        const primaryText = new Alexa.RichTextContentHelper().withPrimaryText(getFinalScore(attributes.quizScore, attributes.counter)).getTextContent();
        response.addRenderTemplateDirective({
          type : 'BodyTemplate1',
          backButton: 'hidden',
          title,
          textContent: primaryText,
        });
      }
      return response.speak(speakOutput).getResponse();
    }
  },
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'Puedes decirme Hola! Cómo puedo ayudarte?';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speechText = 'Adiós!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `Intentaste ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = `Lo siento, Creo que no me lavé bien las orejas. Puedes repertirme de nuevo.`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

/* CONSTANTS */
const skillBuilder = Alexa.SkillBuilders.custom();
const imagePath = "https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/{0}x{1}/{2}._TTH_.png";
const backgroundImagePath = "https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/{0}x{1}/{2}._TTH_.png"
const speechConsCorrect = ['así mero','bien','bravo','bum','claro que sí','eso mero','lotería','oooh','oui oui','perfectísimo'];
const speechConsWrong = ['buuuh','hmm','lastima', 'neeel'];
const data = [
  {Nombre: 'Guadalupe Victoria', AñoNacimiento: 1786, AñoMuerte: 1843, AñoPresidencia: 1824},
  {Nombre: 'Vicente Guerrero', AñoNacimiento: 1782, AñoMuerte: 1831,  AñoPresidencia: 1829},
  {Nombre: 'José María Bocanegra', AñoNacimiento: 1787, AñoMuerte: 1862, AñoPresidencia: 1829},
  {Nombre: 'Anastasio Bustamante', AñoNacimiento: 1780, AñoMuerte: 1853,  AñoPresidencia: 1830},
  {Nombre: 'Melchor Múzquiz', AñoNacimiento: 1790, AñoMuerte: 1844,  AñoPresidencia: 1832},
  {Nombre: 'Manuel Gómez Pedraza', AñoNacimiento: 1789, AñoMuerte: 1851,  AñoPresidencia: 1832},

];

const states = {
  START: `_START`,
  QUIZ: `_QUIZ`,
};


const startQuizMessage = `De acuerdo... Bienvenido al juego del Historiador!..... Te preguntaré 10 cosas sobre los presidentes de México... espero que seas bueno recordando fechas. `;
const exitSkillMessage = `Gracias por jugar, !  Regresa pronto! ¿Quieres intentar otra cosa?`;

const useCardsFlag = true;

/* HELPER FUNCTIONS */

// returns true if the skill is running on a device with a display (show|spot)
function supportsDisplay(handlerInput) {
  var hasDisplay =
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display
  return hasDisplay;
}

function getCurrentScore(score, counter) {
  return `Tu puntuación es de  ${score} de ${counter}. `;
}

function getFinalScore(score, counter) {
  return `Tu puntaje final es de ${score} de ${counter}. `;
}

function getCardTitle(item) {
  return item.Nombre;
}

function getSmallImage(item) {
  return `https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/720x400/${item.Abbreviation}._TTH_.png`;
}

function getLargeImage(item) {
  return `https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/state_flag/1200x800/${item.Abbreviation}._TTH_.png`;
}

function getImage(height, width, label) {
  return imagePath.replace("{0}", height)
    .replace("{1}", width)
    .replace("{2}", label);
}

function getBackgroundImage(label, height = 1024, width = 600) {
  return backgroundImagePath.replace("{0}", height)
    .replace("{1}", width)
    .replace("{2}", label);
}

function getSpeechDescription(item) {
  return `${item.Nombre} es el  ${item.Puesto} de México, nació en  ${item.AñoNacimiento} y murió en  ${item.AñoMuerte} ocupo la presidencia de México en  ${item.AñoPresidencia}...Sobre qué otro presidente quieres saber?`;
}

function formatCasing(key) {
  return key.split(/(?=[A-Z])/).join(' ');
}

function getQuestion(counter, property, item) {
  return `Aquí está tu pregunta numero ${counter}.  Cual es el  ${formatCasing(property)} de ${item.Nombre}?`;
}

// getQuestionWithoutOrdinal returns the question without the ordinal and is
// used for the echo show.
function getQuestionWithoutOrdinal(property, item) {
  return "Cual es " + formatCasing(property).toLowerCase() + " de "  + item.Nombre + "?";
}

function getAnswer(property, item) {
  switch (property) {
    case 'Nombre':
      return `El ${formatCasing(property)} del  ${item.Puesto} de México es  <say-as interpret-as='spell-out'>${item[property]}</say-as>. `;
    default:
      return `El ${formatCasing(property)} de ${item.Nombre} es ${item[property]}. `;
  }
}

function getRandom(min, max) {
  return Math.floor((Math.random() * ((max - min) + 1)) + min);
}

function askQuestion(handlerInput) {
  console.log("I am in askQuestion()");
  //GENERATING THE RANDOM QUESTION FROM DATA
  const random = getRandom(0, data.length - 1);
  const item = data[random];
  const propertyArray = Object.getOwnPropertyNames(item);
  const property = propertyArray[getRandom(1, propertyArray.length - 1)];

  //GET SESSION ATTRIBUTES
  const attributes = handlerInput.attributesManager.getSessionAttributes();

  //SET QUESTION DATA TO ATTRIBUTES
  attributes.selectedItemIndex = random;
  attributes.quizItem = item;
  attributes.quizProperty = property;
  attributes.counter += 1;

  //SAVE ATTRIBUTES
  handlerInput.attributesManager.setSessionAttributes(attributes);

  const question = getQuestion(attributes.counter, property, item);
  return question;
}

function compareSlots(slots, value) {
  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      if (slots[slot].value.toString().toLowerCase() === value.toString().toLowerCase()) {
        return true;
      }
    }
  }

  return false;
}

function getItem(slots) {
  const propertyArray = Object.getOwnPropertyNames(data[0]);
  let slotValue;

  for (const slot in slots) {
    if (Object.prototype.hasOwnProperty.call(slots, slot) && slots[slot].value !== undefined) {
      slotValue = slots[slot].value;
      for (const property in propertyArray) {
        if (Object.prototype.hasOwnProperty.call(propertyArray, property)) {
          const item = data.filter(x => x[propertyArray[property]]
            .toString().toLowerCase() === slots[slot].value.toString().toLowerCase());
          if (item.length > 0) {
            return item[0];
          }
        }
      }
    }
  }
  return slotValue;
}

function getSpeechCon(type) {
  if (type) return `<say-as interpret-as='interjection'>${speechConsCorrect[getRandom(0, speechConsCorrect.length - 1)]}! </say-as><break strength='strong'/>`;
  return `<say-as interpret-as='interjection'>${speechConsWrong[getRandom(0, speechConsWrong.length - 1)]} </say-as><break strength='strong'/>`;
}


function getTextDescription(item) {
  let text = '';

  for (const key in item) {
    if (Object.prototype.hasOwnProperty.call(item, key)) {
      text += `${formatCasing(key)}: ${item[key]}\n`;
    }
  }
  return text;
}

function getAndShuffleMultipleChoiceAnswers(currentIndex, item, property) {
  return shuffle(getMultipleChoiceAnswers(currentIndex, item, property));
}

// This function randomly chooses 3 answers 2 incorrect and 1 correct answer to
// display on the screen using the ListTemplate. It ensures that the list is unique.
function getMultipleChoiceAnswers(currentIndex, item, property) {

  // insert the correct answer first
  let answerList = [item[property]];

  // There's a possibility that we might get duplicate answers
  // 8 states were founded in 1788
  // 4 states were founded in 1889
  // 3 states were founded in 1787
  // to prevent duplicates we need avoid index collisions and take a sample of
  // 8 + 4 + 1 = 13 answers (it's not 8+4+3 because later we take the unique
  // we only need the minimum.)
  let count = 0
  let upperBound = 12

  let seen = new Array();
  seen[currentIndex] = 1;

  while (count < upperBound) {
    let random = getRandom(0, data.length - 1);

    // only add if we haven't seen this index
    if ( seen[random] === undefined ) {
      answerList.push(data[random][property]);
      count++;
    }
  }

  // remove duplicates from the list.
  answerList = answerList.filter((v, i, a) => a.indexOf(v) === i)
  // take the first three items from the list.
  answerList = answerList.slice(0, 3);
  return answerList;
}

// This function takes the contents of an array and randomly shuffles it.
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  while ( 0 !== currentIndex ) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}


// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
         QuizHandler,
    QuizAnswerHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
         DatoCuriosoIntentHandler,
        IntentReflectorHandler) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
