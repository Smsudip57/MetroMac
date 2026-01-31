/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/sw-custom.js":
/*!*****************************!*\
  !*** ./public/sw-custom.js ***!
  \*****************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval(__webpack_require__.ts("// Workbox precaching manifest - injected by next-pwa\n// @ts-expect-error - __WB_MANIFEST is injected by Workbox at runtime\nconst PRECACHE_MANIFEST = [] || [];\n// Get iOS version from user agent\nfunction getIOSVersion() {\n    const match = navigator.userAgent.match(/OS (\\d+)_(\\d+)_?(\\d+)?/);\n    if (match) {\n        return parseInt(match[1], 10);\n    }\n    return null;\n}\nconst iosVersion = getIOSVersion();\nconst supportsIOSPush = iosVersion !== null && iosVersion >= 16;\n// Listen for push events (supported on iOS 16+ and Android)\nself.addEventListener(\"push\", (event)=>{\n    console.log(\"[SW] Push event received:\", event);\n    console.log(\"[SW] iOS Version:\", iosVersion, \"Supports Push:\", supportsIOSPush);\n    if (!event.data) {\n        console.log(\"[SW] No push data\");\n        return;\n    }\n    try {\n        var _data_data;\n        const data = event.data.json();\n        console.log(\"[SW] Push notification data:\", data);\n        const options = {\n            body: data.body || \"New notification\",\n            icon: data.icon || \"/header-logo.png\",\n            badge: data.badge || \"/favicon.ico\",\n            data: data.data || {},\n            tag: ((_data_data = data.data) === null || _data_data === void 0 ? void 0 : _data_data.taskId) || \"notification\",\n            requireInteraction: false,\n            actions: [\n                {\n                    action: \"open\",\n                    title: \"Open\"\n                },\n                {\n                    action: \"close\",\n                    title: \"Close\"\n                }\n            ]\n        };\n        event.waitUntil(self.registration.showNotification(data.title || \"MetroMac\", options));\n    } catch (error) {\n        console.error(\"[SW] Error parsing push data:\", error);\n        // Fallback: show notification with raw data\n        event.waitUntil(self.registration.showNotification(\"MetroMac Notification\", {\n            body: event.data.text ? event.data.text() : \"New notification\",\n            icon: \"/header-logo.png\"\n        }));\n    }\n});\n// Listen for notification clicks\nself.addEventListener(\"notificationclick\", (event)=>{\n    var _event_notification_data;\n    console.log(\"[SW] Notification clicked:\", event.notification);\n    event.notification.close();\n    const taskId = (_event_notification_data = event.notification.data) === null || _event_notification_data === void 0 ? void 0 : _event_notification_data.taskId;\n    const url = taskId ? \"/tasks/view?id=\".concat(taskId) : \"/dashboard\";\n    event.waitUntil(clients.matchAll({\n        type: \"window\"\n    }).then((clientList)=>{\n        // Check if app is already open\n        for (let client of clientList){\n            if (client.url === url && \"focus\" in client) {\n                return client.focus();\n            }\n        }\n        // If not open, open it\n        if (clients.openWindow) {\n            return clients.openWindow(url);\n        }\n    }));\n});\n// Listen for notification close\nself.addEventListener(\"notificationclose\", (event)=>{\n    console.log(\"[SW] Notification closed:\", event.notification);\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxHQUFHLENBQUMsNkJBQTZCRixNQUFNb0IsWUFBWTtBQUM3RCIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9wdWJsaWMvc3ctY3VzdG9tLmpzPzc5N2MiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gV29ya2JveCBwcmVjYWNoaW5nIG1hbmlmZXN0IC0gaW5qZWN0ZWQgYnkgbmV4dC1wd2Fcbi8vIEB0cy1leHBlY3QtZXJyb3IgLSBfX1dCX01BTklGRVNUIGlzIGluamVjdGVkIGJ5IFdvcmtib3ggYXQgcnVudGltZVxuY29uc3QgUFJFQ0FDSEVfTUFOSUZFU1QgPSBzZWxmLl9fV0JfTUFOSUZFU1QgfHwgW107XG5cbi8vIEdldCBpT1MgdmVyc2lvbiBmcm9tIHVzZXIgYWdlbnRcbmZ1bmN0aW9uIGdldElPU1ZlcnNpb24oKSB7XG4gIGNvbnN0IG1hdGNoID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvT1MgKFxcZCspXyhcXGQrKV8/KFxcZCspPy8pO1xuICBpZiAobWF0Y2gpIHtcbiAgICByZXR1cm4gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuY29uc3QgaW9zVmVyc2lvbiA9IGdldElPU1ZlcnNpb24oKTtcbmNvbnN0IHN1cHBvcnRzSU9TUHVzaCA9IGlvc1ZlcnNpb24gIT09IG51bGwgJiYgaW9zVmVyc2lvbiA+PSAxNjtcblxuLy8gTGlzdGVuIGZvciBwdXNoIGV2ZW50cyAoc3VwcG9ydGVkIG9uIGlPUyAxNisgYW5kIEFuZHJvaWQpXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJwdXNoXCIsIChldmVudCkgPT4ge1xuICBjb25zb2xlLmxvZyhcIltTV10gUHVzaCBldmVudCByZWNlaXZlZDpcIiwgZXZlbnQpO1xuICBjb25zb2xlLmxvZyhcbiAgICBcIltTV10gaU9TIFZlcnNpb246XCIsXG4gICAgaW9zVmVyc2lvbixcbiAgICBcIlN1cHBvcnRzIFB1c2g6XCIsXG4gICAgc3VwcG9ydHNJT1NQdXNoXG4gICk7XG5cbiAgaWYgKCFldmVudC5kYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJbU1ddIE5vIHB1c2ggZGF0YVwiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhLmpzb24oKTtcbiAgICBjb25zb2xlLmxvZyhcIltTV10gUHVzaCBub3RpZmljYXRpb24gZGF0YTpcIiwgZGF0YSk7XG5cbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgYm9keTogZGF0YS5ib2R5IHx8IFwiTmV3IG5vdGlmaWNhdGlvblwiLFxuICAgICAgaWNvbjogZGF0YS5pY29uIHx8IFwiL2hlYWRlci1sb2dvLnBuZ1wiLFxuICAgICAgYmFkZ2U6IGRhdGEuYmFkZ2UgfHwgXCIvZmF2aWNvbi5pY29cIixcbiAgICAgIGRhdGE6IGRhdGEuZGF0YSB8fCB7fSxcbiAgICAgIHRhZzogZGF0YS5kYXRhPy50YXNrSWQgfHwgXCJub3RpZmljYXRpb25cIixcbiAgICAgIHJlcXVpcmVJbnRlcmFjdGlvbjogZmFsc2UsXG4gICAgICBhY3Rpb25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBhY3Rpb246IFwib3BlblwiLFxuICAgICAgICAgIHRpdGxlOiBcIk9wZW5cIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGFjdGlvbjogXCJjbG9zZVwiLFxuICAgICAgICAgIHRpdGxlOiBcIkNsb3NlXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG5cbiAgICBldmVudC53YWl0VW50aWwoXG4gICAgICBzZWxmLnJlZ2lzdHJhdGlvbi5zaG93Tm90aWZpY2F0aW9uKGRhdGEudGl0bGUgfHwgXCJNZXRyb01hY1wiLCBvcHRpb25zKVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIltTV10gRXJyb3IgcGFyc2luZyBwdXNoIGRhdGE6XCIsIGVycm9yKTtcblxuICAgIC8vIEZhbGxiYWNrOiBzaG93IG5vdGlmaWNhdGlvbiB3aXRoIHJhdyBkYXRhXG4gICAgZXZlbnQud2FpdFVudGlsKFxuICAgICAgc2VsZi5yZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbihcIk1ldHJvTWFjIE5vdGlmaWNhdGlvblwiLCB7XG4gICAgICAgIGJvZHk6IGV2ZW50LmRhdGEudGV4dCA/IGV2ZW50LmRhdGEudGV4dCgpIDogXCJOZXcgbm90aWZpY2F0aW9uXCIsXG4gICAgICAgIGljb246IFwiL2hlYWRlci1sb2dvLnBuZ1wiLFxuICAgICAgfSlcbiAgICApO1xuICB9XG59KTtcblxuLy8gTGlzdGVuIGZvciBub3RpZmljYXRpb24gY2xpY2tzXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJub3RpZmljYXRpb25jbGlja1wiLCAoZXZlbnQpID0+IHtcbiAgY29uc29sZS5sb2coXCJbU1ddIE5vdGlmaWNhdGlvbiBjbGlja2VkOlwiLCBldmVudC5ub3RpZmljYXRpb24pO1xuICBldmVudC5ub3RpZmljYXRpb24uY2xvc2UoKTtcblxuICBjb25zdCB0YXNrSWQgPSBldmVudC5ub3RpZmljYXRpb24uZGF0YT8udGFza0lkO1xuICBjb25zdCB1cmwgPSB0YXNrSWQgPyBgL3Rhc2tzL3ZpZXc/aWQ9JHt0YXNrSWR9YCA6IFwiL2Rhc2hib2FyZFwiO1xuXG4gIGV2ZW50LndhaXRVbnRpbChcbiAgICBjbGllbnRzLm1hdGNoQWxsKHsgdHlwZTogXCJ3aW5kb3dcIiB9KS50aGVuKChjbGllbnRMaXN0KSA9PiB7XG4gICAgICAvLyBDaGVjayBpZiBhcHAgaXMgYWxyZWFkeSBvcGVuXG4gICAgICBmb3IgKGxldCBjbGllbnQgb2YgY2xpZW50TGlzdCkge1xuICAgICAgICBpZiAoY2xpZW50LnVybCA9PT0gdXJsICYmIFwiZm9jdXNcIiBpbiBjbGllbnQpIHtcbiAgICAgICAgICByZXR1cm4gY2xpZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIElmIG5vdCBvcGVuLCBvcGVuIGl0XG4gICAgICBpZiAoY2xpZW50cy5vcGVuV2luZG93KSB7XG4gICAgICAgIHJldHVybiBjbGllbnRzLm9wZW5XaW5kb3codXJsKTtcbiAgICAgIH1cbiAgICB9KVxuICApO1xufSk7XG5cbi8vIExpc3RlbiBmb3Igbm90aWZpY2F0aW9uIGNsb3NlXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJub3RpZmljYXRpb25jbG9zZVwiLCAoZXZlbnQpID0+IHtcbiAgY29uc29sZS5sb2coXCJbU1ddIE5vdGlmaWNhdGlvbiBjbG9zZWQ6XCIsIGV2ZW50Lm5vdGlmaWNhdGlvbik7XG59KTtcbiJdLCJuYW1lcyI6WyJQUkVDQUNIRV9NQU5JRkVTVCIsInNlbGYiLCJfX1dCX01BTklGRVNUIiwiZ2V0SU9TVmVyc2lvbiIsIm1hdGNoIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwicGFyc2VJbnQiLCJpb3NWZXJzaW9uIiwic3VwcG9ydHNJT1NQdXNoIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwiY29uc29sZSIsImxvZyIsImRhdGEiLCJqc29uIiwib3B0aW9ucyIsImJvZHkiLCJpY29uIiwiYmFkZ2UiLCJ0YWciLCJ0YXNrSWQiLCJyZXF1aXJlSW50ZXJhY3Rpb24iLCJhY3Rpb25zIiwiYWN0aW9uIiwidGl0bGUiLCJ3YWl0VW50aWwiLCJyZWdpc3RyYXRpb24iLCJzaG93Tm90aWZpY2F0aW9uIiwiZXJyb3IiLCJ0ZXh0Iiwibm90aWZpY2F0aW9uIiwiY2xvc2UiLCJ1cmwiLCJjbGllbnRzIiwibWF0Y2hBbGwiLCJ0eXBlIiwidGhlbiIsImNsaWVudExpc3QiLCJjbGllbnQiLCJmb2N1cyIsIm9wZW5XaW5kb3ciXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./public/sw-custom.js\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	!function() {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = function() {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: function(script) { return script; }
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	!function() {
/******/ 		__webpack_require__.ts = function(script) { return __webpack_require__.tt().createScript(script); };
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	!function() {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push(function(options) {
/******/ 			var originalFactory = options.factory;
/******/ 			options.factory = function(moduleObject, moduleExports, webpackRequire) {
/******/ 				var hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				var cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : function() {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./public/sw-custom.js");
/******/ 	
/******/ })()
;