import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  compileTemplate(template: string, data: Record<string, any>): string {
    // Erzeuge sicheren HTML-Code für Variablen, die HTML enthalten
    if (data.inserat) {
      data.inserat = new handlebars.SafeString(data.inserat);
    }

    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate(data);
  }
}
