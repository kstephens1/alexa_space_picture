/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
var request = require('request');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

function callNasa(callback){
  var endpoint1 = "https://api.nasa.gov/planetary/apod?api_key=SvzNrrr9PpYc0tVb3LDh1SUON6s4J20tZT14rByQ";
  request(endpoint1, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body)
      }
      callback(info.title, info.hdurl);
    });
}


const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
  },
  handle(handlerInput) {
    return new Promise((resolve) => {
      callNasa((explanation, n_url) => {
          const speechOutput = explanation;

          console.log('Step 1');
          var response = "";

          if (supportsDisplay(handlerInput)) {
//            const image_url = "https://apod.nasa.gov/apod/image/1809/SaturnAurora_Hubble_960.jpg";
            const image_url = n_url; 
            const display_type = "BodyTemplate2";
            response = getDisplay(handlerInput.responseBuilder, image_url, display_type, explanation);
            console.log('Step 2');
          }
          else{
            response = handlerInput.responseBuilder.withSimpleCard('Space Picture of the Day',explanation);
            console.log('Step 3');
          }

          console.log('Step 4');
          
//          resolve(handlerInput.responseBuilder.speak(speechOutput).withSimpleCard("Nasa Pic", speechOutput).getResponse());
          resolve(response.speak(speechOutput).reprompt(speechOutput).getResponse());

        });
  });
},
};

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

function getDisplay(response, image_url, display_type, explanation){
	const image = new Alexa.ImageHelper().addImageInstance(image_url).getImage();
	console.log("the display type is => " + display_type);


	const myTextContent = new Alexa.RichTextContentHelper()
	.withPrimaryText(explanation +'<br/>').getTextContent();
	//.withSecondaryText('Secondary text')
	//.withTertiaryText("<br/> <font size='4'>Tertiary text</font>")


	if (display_type == "BodyTemplate7"){
		//use background image
		response.addRenderTemplateDirective({
			type: display_type,
			backButton: 'visible',
			backgroundImage: image,
			title:"Space Picture of the Day",
			textContent: myTextContent,
			});	
	}
	else{
		response.addRenderTemplateDirective({
			//use 340x340 image on the right with text on the left.
			type: display_type,
			backButton: 'visible',
			backgroundImage: image,
//      image: image,
			title:"Space Picture of the Day",
			textContent: myTextContent,
			});	
	}
	
	return response;
}


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
