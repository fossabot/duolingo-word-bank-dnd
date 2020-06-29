import { _, it, lift } from 'param.macro';
import { Draggable, Sortable } from '@shopify/draggable';

const ANSWER_SELECTOR = '._3ysW7';
const SOURCE_SELECTOR = '[data-test="word-bank"]';

const WORD_SELECTORS = [ '._2T0K5', '._10L3U' ];
const WORD_BUTTON_SELECTOR = WORD_SELECTORS.map(`${it} button`).join(',');
const DRAGGABLE_WORD_SELECTOR = WORD_SELECTORS.map(`${ANSWER_SELECTOR} ${it}`).join(',');

let wordBankAnswer = null;

setInterval(() => {
  const newWordBankAnswer = document.querySelector(ANSWER_SELECTOR);

  if (newWordBankAnswer !== wordBankAnswer) {
    wordBankAnswer = newWordBankAnswer;

    if (!wordBankAnswer) {
      return;
    }

    const sortable = new Sortable(wordBankAnswer, {
      draggable: DRAGGABLE_WORD_SELECTOR,
      distance: 5,
    });

    sortable.removePlugin(Draggable.Plugins.Mirror);

    sortable.on('sortable:stop', event => {
      const wordBankSource = document.querySelector(SOURCE_SELECTOR);

      if (!wordBankSource) {
        return;
      }

      const answerWordButtons = Array.from(wordBankAnswer.querySelectorAll(WORD_BUTTON_SELECTOR));

      const sortedWords = answerWordButtons.map(button => {
        // Trigger the word removal.
        button.click();

        return button.parentNode.classList.contains('draggable--original')
          ? ''
          : button.innerText.trim();
      }).filter(it.length > 0);

      // Sometimes, the "draggable" plugin does not clean everything up.
      while (wordBankAnswer.firstChild) {
        wordBankAnswer.removeChild(wordBankAnswer.firstChild);
      }

      // The "draggable" plugin will attempt to move an element we have removed - make sure that it won't fail.
      const fakeSourceWrapper = document.createElement('div');
      fakeSourceWrapper.appendChild(event.dragEvent.source);

      const sourceButtons = Array.from(wordBankSource.querySelectorAll(WORD_BUTTON_SELECTOR));

      // Add the words back, in the right order.
      sourceButtons
        .map(button => [ sortedWords.indexOf(button.innerText.trim()), button ])
        .filter(it[0] >= 0)
        .sort(lift(_[0] - _[0]))
        .forEach(it[1].click());
    });
  }
}, 50);