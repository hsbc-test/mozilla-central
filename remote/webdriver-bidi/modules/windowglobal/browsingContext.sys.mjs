/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Module } from "chrome://remote/content/shared/messagehandler/Module.sys.mjs";

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
  LoadListener: "chrome://remote/content/shared/listeners/LoadListener.sys.mjs",
});

class BrowsingContextModule extends Module {
  #loadListener;
  #subscribedEvents;

  constructor(messageHandler) {
    super(messageHandler);

    // Setup the LoadListener as early as possible.
    this.#loadListener = new lazy.LoadListener(this.messageHandler.window);
    this.#loadListener.on("DOMContentLoaded", this.#onDOMContentLoaded);
    this.#loadListener.on("load", this.#onLoad);

    // Set of event names which have active subscriptions
    this.#subscribedEvents = new Set();
  }

  destroy() {
    this.#loadListener.destroy();
    this.#subscribedEvents = null;
  }

  #getNavigationInfo(data) {
    return {
      context: this.messageHandler.context,
      // TODO: The navigation id should be a real id mapped to the navigation.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=1763122
      navigation: null,
      url: data.target.baseURI,
    };
  }

  #startListening() {
    if (this.#subscribedEvents.size == 0) {
      this.#loadListener.startListening();
    }
  }

  #stopListening() {
    if (this.#subscribedEvents.size == 0) {
      this.#loadListener.stopListening();
    }
  }

  #subscribeEvent(event) {
    switch (event) {
      case "browsingContext._documentInteractive":
        this.#startListening();
        this.#subscribedEvents.add("browsingContext._documentInteractive");
        break;
      case "browsingContext.domContentLoaded":
        this.#startListening();
        this.#subscribedEvents.add("browsingContext.domContentLoaded");
        break;
      case "browsingContext.load":
        this.#startListening();
        this.#subscribedEvents.add("browsingContext.load");
        break;
    }
  }

  #unsubscribeEvent(event) {
    switch (event) {
      case "browsingContext._documentInteractive":
        this.#subscribedEvents.delete("browsingContext._documentInteractive");
        break;
      case "browsingContext.domContentLoaded":
        this.#subscribedEvents.delete("browsingContext.domContentLoaded");
        break;
      case "browsingContext.load":
        this.#subscribedEvents.delete("browsingContext.load");
        break;
    }

    this.#stopListening();
  }

  #onDOMContentLoaded = (eventName, data) => {
    if (this.#subscribedEvents.has("browsingContext._documentInteractive")) {
      this.messageHandler.emitEvent("browsingContext._documentInteractive", {
        baseURL: data.target.baseURI,
        contextId: this.messageHandler.contextId,
        documentURL: data.target.URL,
        innerWindowId: this.messageHandler.innerWindowId,
        readyState: data.target.readyState,
      });
    }

    if (this.#subscribedEvents.has("browsingContext.domContentLoaded")) {
      this.emitEvent(
        "browsingContext.domContentLoaded",
        this.#getNavigationInfo(data)
      );
    }
  };

  #onLoad = (eventName, data) => {
    if (this.#subscribedEvents.has("browsingContext.load")) {
      this.emitEvent("browsingContext.load", this.#getNavigationInfo(data));
    }
  };

  /**
   * Internal commands
   */

  _applySessionData(params) {
    // TODO: Bug 1775231. Move this logic to a shared module or an abstract
    // class.
    const { category, added = [], removed = [] } = params;
    if (category === "event") {
      for (const event of added) {
        this.#subscribeEvent(event);
      }
      for (const event of removed) {
        this.#unsubscribeEvent(event);
      }
    }
  }

  _getBaseURL() {
    return this.messageHandler.window.document.baseURI;
  }

  _getScreenshotRect() {
    const win = this.messageHandler.window;
    return new DOMRect(
      win.pageXOffset,
      win.pageYOffset,
      win.innerWidth,
      win.innerHeight
    );
  }
}

export const browsingContext = BrowsingContextModule;
