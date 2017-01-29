import { Injectable } from '@angular/core';

declare class SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent)=>void;
  start: ()=>void;
  stop: ()=>void;
}

declare class SpeechRecognitionResultAlternative {
  readonly confidence: number;
  readonly transcript: string;
}

declare class SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionResultAlternative;
}

declare class SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResult[];
}

declare class SpeechRecognitionWindow extends Window {
  readonly SpeechRecognition: typeof SpeechRecognition;
  readonly SpeechRecognitionEvent: typeof SpeechRecognitionEvent;
  readonly SpeechGrammarList: any;

  readonly webkitSpeechRecognition: typeof SpeechRecognition;
  readonly webkitSpeechRecognitionEvent: typeof SpeechRecognitionEvent;
  readonly webkitSpeechGrammarList: any;
}

declare let window: SpeechRecognitionWindow;

@Injectable()
export class SpeechService {
  private _recognition: SpeechRecognition;

  constructor() {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    this._recognition = new SpeechRecognition();
    this._recognition.lang = 'ru-RU';
    this._recognition.continuous = true;
    this._recognition.interimResults = true;
    this._recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.handleResults(event);
    };
  }

  public start() {
    this._recognition.start();
  }

  public handleResults(event: SpeechRecognitionEvent) {
    this._recognition.stop();
    console.log(event.results[0][0].transcript);
  }
}
