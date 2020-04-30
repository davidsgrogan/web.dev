import {dimensions} from 'webdev_analytics';
import {store} from './store';

// Events missing from DevSite include:
//   * "devsite-analytics-observation", generated by the Metric class for page load timing
//   * "devsite-analytics-error", wired up to the onerror handler
//   * "devsite-analytics-set-dimension", for user response to custom questions
//   * "devsite-analytics-scope", which constructs complex click events (was used for header)
//
// Note that many parts of our code are annotated with an "gc-analytics-event" attribute, but this
// is actually ignored in DevSite v2. Instead, any links that have `data-category` automatically
// have clicks logged (see below).

function getAnalyticsDataFromElement(elem, defaultAction = 'click') {
  const category = elem.dataset['category'] || undefined;
  const action = elem.dataset['action'] || defaultAction;
  const label = elem.dataset['label'] || undefined;
  const value = Number(elem.dataset['value']) || undefined; // must be number, or is ignored
  return {
    category,
    action,
    label,
    value,
  };
}

function trackEvent({category, action, label, value}) {
  ga('send', 'event', {
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    eventValue: value,
  });
}

/**
 * Configure tracking events for any clicks on a link (`<a href="...">`)
 * or another trackable element (class="gc-analytics-event"), searching
 * for (requiring at least `data-category`, but also allowing
 * `data-action`, `data-label` and `data-value`.
 */
document.addEventListener('click', (e) => {
  const clickableEl = e.target.closest('a[href], .gc-analytics-event');
  if (!clickableEl) {
    return;
  }

  const data = getAnalyticsDataFromElement(clickableEl);
  if (!data.category) {
    return; // category is required
  }

  trackEvent(data);
});

// Update Analytics dimension if signed-in state changes. This doesn't cause a
// new pageview implicitly but annotates all further events.
// We log pageviews only in basic.js (on entry, for all browsers) and in loader.js
// (for dynamic SPA page loads).
store.subscribe(({isSignedIn}) => {
  ga('set', dimensions.SIGNED_IN, isSignedIn ? 1 : 0);
});
