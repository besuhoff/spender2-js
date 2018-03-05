import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  transform(value: string, searchTerm?: string): any {
    if (!searchTerm) {
      return value;
    }

    const terms = searchTerm.split(/\s+/).map(term => term.toLowerCase());
    const lower = value.toLowerCase();

    for (let i = 0; i < lower.length; i++) {
      terms.forEach(term => {
        if (lower.substr(i, term.length) === term) {
          value = value.substr(0, i) + '<span class="highlighted">' + value.substr(i, term.length) + '</span>'
            +  value.substr(i + term.length);
        }
      });
    }

    return value;
  }

}
