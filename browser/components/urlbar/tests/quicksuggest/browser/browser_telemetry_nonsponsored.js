/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/**
 * This file tests primary telemetry for nonsponsored suggestions.
 */

"use strict";

ChromeUtils.defineESModuleGetters(this, {
  CONTEXTUAL_SERVICES_PING_TYPES:
    "resource:///modules/PartnerLinkAttribution.sys.mjs",
});

const { TELEMETRY_SCALARS } = UrlbarProviderQuickSuggest;

const suggestion = {
  id: 1,
  url: "https://example.com/nonsponsored",
  title: "Non-sponsored suggestion",
  keywords: ["nonsponsored"],
  click_url: "https://example.com/click",
  impression_url: "https://example.com/impression",
  advertiser: "testadvertiser",
  iab_category: "5 - Education",
};

const suggestion_type = "nonsponsored";
const index = 1;
const position = index + 1;

add_setup(async function() {
  await setUpTelemetryTest({
    suggestions: [suggestion],
  });
});

// nonsponsored
add_task(async function nonsponsored() {
  let match_type = "firefox-suggest";
  await doTelemetryTest({
    index,
    suggestion,
    // impression-only
    impressionOnly: {
      scalars: {
        [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED]: position,
      },
      event: {
        category: QuickSuggest.TELEMETRY_EVENT_CATEGORY,
        method: "engagement",
        object: "impression_only",
        extra: {
          suggestion_type,
          match_type,
          position: position.toString(),
        },
      },
      ping: {
        type: CONTEXTUAL_SERVICES_PING_TYPES.QS_IMPRESSION,
        payload: {
          match_type,
          position,
          is_clicked: false,
          improve_suggest_experience_checked: false,
          block_id: suggestion.id,
          advertiser: suggestion.advertiser,
        },
      },
    },
    selectables: {
      // click
      "urlbarView-row-inner": {
        scalars: {
          [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED]: position,
          [TELEMETRY_SCALARS.CLICK_NONSPONSORED]: position,
        },
        event: {
          category: QuickSuggest.TELEMETRY_EVENT_CATEGORY,
          method: "engagement",
          object: "click",
          extra: {
            suggestion_type,
            match_type,
            position: position.toString(),
          },
        },
        pings: [
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_IMPRESSION,
            payload: {
              match_type,
              position,
              is_clicked: true,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
            },
          },
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_SELECTION,
            payload: {
              match_type,
              position,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
            },
          },
        ],
      },
      // block
      "urlbarView-button-block": {
        scalars: {
          [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED]: position,
          [TELEMETRY_SCALARS.BLOCK_NONSPONSORED]: position,
        },
        event: {
          category: QuickSuggest.TELEMETRY_EVENT_CATEGORY,
          method: "engagement",
          object: "block",
          extra: {
            suggestion_type,
            match_type,
            position: position.toString(),
          },
        },
        pings: [
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_IMPRESSION,
            payload: {
              match_type,
              position,
              is_clicked: false,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
            },
          },
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_BLOCK,
            payload: {
              match_type,
              position,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
              iab_category: suggestion.iab_category,
            },
          },
        ],
      },
      // help
      "urlbarView-button-help": {
        scalars: {
          [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED]: position,
          [TELEMETRY_SCALARS.HELP_NONSPONSORED]: position,
        },
        event: {
          category: QuickSuggest.TELEMETRY_EVENT_CATEGORY,
          method: "engagement",
          object: "help",
          extra: {
            suggestion_type,
            match_type,
            position: position.toString(),
          },
        },
        pings: [
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_IMPRESSION,
            payload: {
              match_type,
              position,
              is_clicked: false,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
            },
          },
        ],
      },
    },
  });
});

// nonsponsored best match
add_task(async function nonsponsoredBestMatch() {
  let match_type = "best-match";
  await SpecialPowers.pushPrefEnv({
    set: [["browser.urlbar.bestMatch.enabled", true]],
  });
  await doTelemetryTest({
    index,
    suggestion,
    // impression-only
    impressionOnly: {
      scalars: {
        [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED]: position,
        [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED_BEST_MATCH]: position,
      },
      event: {
        category: QuickSuggest.TELEMETRY_EVENT_CATEGORY,
        method: "engagement",
        object: "impression_only",
        extra: {
          suggestion_type,
          match_type,
          position: position.toString(),
        },
      },
      ping: {
        type: CONTEXTUAL_SERVICES_PING_TYPES.QS_IMPRESSION,
        payload: {
          match_type,
          position,
          is_clicked: false,
          improve_suggest_experience_checked: false,
          block_id: suggestion.id,
          advertiser: suggestion.advertiser,
        },
      },
    },
    selectables: {
      // click
      "urlbarView-row-inner": {
        scalars: {
          [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED]: position,
          [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED_BEST_MATCH]: position,
          [TELEMETRY_SCALARS.CLICK_NONSPONSORED]: position,
          [TELEMETRY_SCALARS.CLICK_NONSPONSORED_BEST_MATCH]: position,
        },
        event: {
          category: QuickSuggest.TELEMETRY_EVENT_CATEGORY,
          method: "engagement",
          object: "click",
          extra: {
            suggestion_type,
            match_type,
            position: position.toString(),
          },
        },
        pings: [
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_IMPRESSION,
            payload: {
              match_type,
              position,
              is_clicked: true,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
            },
          },
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_SELECTION,
            payload: {
              match_type,
              position,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
            },
          },
        ],
      },
      // block
      "urlbarView-button-block": {
        scalars: {
          [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED]: position,
          [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED_BEST_MATCH]: position,
          [TELEMETRY_SCALARS.BLOCK_NONSPONSORED]: position,
          [TELEMETRY_SCALARS.BLOCK_NONSPONSORED_BEST_MATCH]: position,
        },
        event: {
          category: QuickSuggest.TELEMETRY_EVENT_CATEGORY,
          method: "engagement",
          object: "block",
          extra: {
            suggestion_type,
            match_type,
            position: position.toString(),
          },
        },
        pings: [
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_IMPRESSION,
            payload: {
              match_type,
              position,
              is_clicked: false,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
            },
          },
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_BLOCK,
            payload: {
              match_type,
              position,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
              iab_category: suggestion.iab_category,
            },
          },
        ],
      },
      // help
      "urlbarView-button-help": {
        scalars: {
          [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED]: position,
          [TELEMETRY_SCALARS.IMPRESSION_NONSPONSORED_BEST_MATCH]: position,
          [TELEMETRY_SCALARS.HELP_NONSPONSORED]: position,
          [TELEMETRY_SCALARS.HELP_NONSPONSORED_BEST_MATCH]: position,
        },
        event: {
          category: QuickSuggest.TELEMETRY_EVENT_CATEGORY,
          method: "engagement",
          object: "help",
          extra: {
            suggestion_type,
            match_type,
            position: position.toString(),
          },
        },
        pings: [
          {
            type: CONTEXTUAL_SERVICES_PING_TYPES.QS_IMPRESSION,
            payload: {
              match_type,
              position,
              is_clicked: false,
              improve_suggest_experience_checked: false,
              block_id: suggestion.id,
              advertiser: suggestion.advertiser,
            },
          },
        ],
      },
    },
  });
  await SpecialPowers.popPrefEnv();
});
