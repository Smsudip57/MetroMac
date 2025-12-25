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

eval(__webpack_require__.ts("// Workbox precaching manifest - injected by next-pwa\n// @ts-expect-error - __WB_MANIFEST is injected by Workbox at runtime\nconst PRECACHE_MANIFEST = [] || [];\n// Get iOS version from user agent\nfunction getIOSVersion() {\n    const match = navigator.userAgent.match(/OS (\\d+)_(\\d+)_?(\\d+)?/);\n    if (match) {\n        return parseInt(match[1], 10);\n    }\n    return null;\n}\nconst iosVersion = getIOSVersion();\nconst supportsIOSPush = iosVersion !== null && iosVersion >= 16;\n// Listen for push events (supported on iOS 16+ and Android)\nself.addEventListener(\"push\", (event)=>{\n    console.log(\"[SW] Push event received:\", event);\n    console.log(\"[SW] iOS Version:\", iosVersion, \"Supports Push:\", supportsIOSPush);\n    if (!event.data) {\n        console.log(\"[SW] No push data\");\n        return;\n    }\n    try {\n        var _data_data;\n        const data = event.data.json();\n        console.log(\"[SW] Push notification data:\", data);\n        const options = {\n            body: data.body || \"New notification\",\n            icon: data.icon || \"/header-logo.png\",\n            badge: data.badge || \"/favicon.ico\",\n            data: data.data || {},\n            tag: ((_data_data = data.data) === null || _data_data === void 0 ? void 0 : _data_data.taskId) || \"notification\",\n            requireInteraction: false,\n            actions: [\n                {\n                    action: \"open\",\n                    title: \"Open\"\n                },\n                {\n                    action: \"close\",\n                    title: \"Close\"\n                }\n            ]\n        };\n        event.waitUntil(self.registration.showNotification(data.title || \"MetroMac\", options));\n    } catch (error) {\n        console.error(\"[SW] Error parsing push data:\", error);\n        // Fallback: show notification with raw data\n        event.waitUntil(self.registration.showNotification(\"MetroMac Notification\", {\n            body: event.data.text ? event.data.text() : \"New notification\",\n            icon: \"/header-logo.png\"\n        }));\n    }\n});\n// Listen for notification clicks\nself.addEventListener(\"notificationclick\", (event)=>{\n    var _event_notification_data;\n    console.log(\"[SW] Notification clicked:\", event.notification);\n    event.notification.close();\n    const taskId = (_event_notification_data = event.notification.data) === null || _event_notification_data === void 0 ? void 0 : _event_notification_data.taskId;\n    const url = taskId ? \"/tasks/view?id=\".concat(taskId) : \"/dashboard\";\n    event.waitUntil(clients.matchAll({\n        type: \"window\"\n    }).then((clientList)=>{\n        // Check if app is already open\n        for (let client of clientList){\n            if (client.url === url && \"focus\" in client) {\n                return client.focus();\n            }\n        }\n        // If not open, open it\n        if (clients.openWindow) {\n            return clients.openWindow(url);\n        }\n    }));\n});\n// Listen for notification close\nself.addEventListener(\"notificationclose\", (event)=>{\n    console.log(\"[SW] Notification closed:\", event.notification);\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxHQUFHLENBQUMsNkJBQTZCRixNQUFNb0IsWUFBWTtBQUM3RCIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9wdWJsaWMvc3ctY3VzdG9tLmpzPzc5N2MiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gV29ya2JveCBwcmVjYWNoaW5nIG1hbmlmZXN0IC0gaW5qZWN0ZWQgYnkgbmV4dC1wd2FcclxuLy8gQHRzLWV4cGVjdC1lcnJvciAtIF9fV0JfTUFOSUZFU1QgaXMgaW5qZWN0ZWQgYnkgV29ya2JveCBhdCBydW50aW1lXHJcbmNvbnN0IFBSRUNBQ0hFX01BTklGRVNUID0gc2VsZi5fX1dCX01BTklGRVNUIHx8IFtdO1xyXG5cclxuLy8gR2V0IGlPUyB2ZXJzaW9uIGZyb20gdXNlciBhZ2VudFxyXG5mdW5jdGlvbiBnZXRJT1NWZXJzaW9uKCkge1xyXG4gIGNvbnN0IG1hdGNoID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvT1MgKFxcZCspXyhcXGQrKV8/KFxcZCspPy8pO1xyXG4gIGlmIChtYXRjaCkge1xyXG4gICAgcmV0dXJuIHBhcnNlSW50KG1hdGNoWzFdLCAxMCk7XHJcbiAgfVxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5jb25zdCBpb3NWZXJzaW9uID0gZ2V0SU9TVmVyc2lvbigpO1xyXG5jb25zdCBzdXBwb3J0c0lPU1B1c2ggPSBpb3NWZXJzaW9uICE9PSBudWxsICYmIGlvc1ZlcnNpb24gPj0gMTY7XHJcblxyXG4vLyBMaXN0ZW4gZm9yIHB1c2ggZXZlbnRzIChzdXBwb3J0ZWQgb24gaU9TIDE2KyBhbmQgQW5kcm9pZClcclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKFwicHVzaFwiLCAoZXZlbnQpID0+IHtcclxuICBjb25zb2xlLmxvZyhcIltTV10gUHVzaCBldmVudCByZWNlaXZlZDpcIiwgZXZlbnQpO1xyXG4gIGNvbnNvbGUubG9nKFxyXG4gICAgXCJbU1ddIGlPUyBWZXJzaW9uOlwiLFxyXG4gICAgaW9zVmVyc2lvbixcclxuICAgIFwiU3VwcG9ydHMgUHVzaDpcIixcclxuICAgIHN1cHBvcnRzSU9TUHVzaFxyXG4gICk7XHJcblxyXG4gIGlmICghZXZlbnQuZGF0YSkge1xyXG4gICAgY29uc29sZS5sb2coXCJbU1ddIE5vIHB1c2ggZGF0YVwiKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBkYXRhID0gZXZlbnQuZGF0YS5qc29uKCk7XHJcbiAgICBjb25zb2xlLmxvZyhcIltTV10gUHVzaCBub3RpZmljYXRpb24gZGF0YTpcIiwgZGF0YSk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgYm9keTogZGF0YS5ib2R5IHx8IFwiTmV3IG5vdGlmaWNhdGlvblwiLFxyXG4gICAgICBpY29uOiBkYXRhLmljb24gfHwgXCIvaGVhZGVyLWxvZ28ucG5nXCIsXHJcbiAgICAgIGJhZGdlOiBkYXRhLmJhZGdlIHx8IFwiL2Zhdmljb24uaWNvXCIsXHJcbiAgICAgIGRhdGE6IGRhdGEuZGF0YSB8fCB7fSxcclxuICAgICAgdGFnOiBkYXRhLmRhdGE/LnRhc2tJZCB8fCBcIm5vdGlmaWNhdGlvblwiLFxyXG4gICAgICByZXF1aXJlSW50ZXJhY3Rpb246IGZhbHNlLFxyXG4gICAgICBhY3Rpb25zOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgYWN0aW9uOiBcIm9wZW5cIixcclxuICAgICAgICAgIHRpdGxlOiBcIk9wZW5cIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGFjdGlvbjogXCJjbG9zZVwiLFxyXG4gICAgICAgICAgdGl0bGU6IFwiQ2xvc2VcIixcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfTtcclxuXHJcbiAgICBldmVudC53YWl0VW50aWwoXHJcbiAgICAgIHNlbGYucmVnaXN0cmF0aW9uLnNob3dOb3RpZmljYXRpb24oZGF0YS50aXRsZSB8fCBcIk1ldHJvTWFjXCIsIG9wdGlvbnMpXHJcbiAgICApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiW1NXXSBFcnJvciBwYXJzaW5nIHB1c2ggZGF0YTpcIiwgZXJyb3IpO1xyXG5cclxuICAgIC8vIEZhbGxiYWNrOiBzaG93IG5vdGlmaWNhdGlvbiB3aXRoIHJhdyBkYXRhXHJcbiAgICBldmVudC53YWl0VW50aWwoXHJcbiAgICAgIHNlbGYucmVnaXN0cmF0aW9uLnNob3dOb3RpZmljYXRpb24oXCJNZXRyb01hYyBOb3RpZmljYXRpb25cIiwge1xyXG4gICAgICAgIGJvZHk6IGV2ZW50LmRhdGEudGV4dCA/IGV2ZW50LmRhdGEudGV4dCgpIDogXCJOZXcgbm90aWZpY2F0aW9uXCIsXHJcbiAgICAgICAgaWNvbjogXCIvaGVhZGVyLWxvZ28ucG5nXCIsXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyBMaXN0ZW4gZm9yIG5vdGlmaWNhdGlvbiBjbGlja3Ncclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKFwibm90aWZpY2F0aW9uY2xpY2tcIiwgKGV2ZW50KSA9PiB7XHJcbiAgY29uc29sZS5sb2coXCJbU1ddIE5vdGlmaWNhdGlvbiBjbGlja2VkOlwiLCBldmVudC5ub3RpZmljYXRpb24pO1xyXG4gIGV2ZW50Lm5vdGlmaWNhdGlvbi5jbG9zZSgpO1xyXG5cclxuICBjb25zdCB0YXNrSWQgPSBldmVudC5ub3RpZmljYXRpb24uZGF0YT8udGFza0lkO1xyXG4gIGNvbnN0IHVybCA9IHRhc2tJZCA/IGAvdGFza3Mvdmlldz9pZD0ke3Rhc2tJZH1gIDogXCIvZGFzaGJvYXJkXCI7XHJcblxyXG4gIGV2ZW50LndhaXRVbnRpbChcclxuICAgIGNsaWVudHMubWF0Y2hBbGwoeyB0eXBlOiBcIndpbmRvd1wiIH0pLnRoZW4oKGNsaWVudExpc3QpID0+IHtcclxuICAgICAgLy8gQ2hlY2sgaWYgYXBwIGlzIGFscmVhZHkgb3BlblxyXG4gICAgICBmb3IgKGxldCBjbGllbnQgb2YgY2xpZW50TGlzdCkge1xyXG4gICAgICAgIGlmIChjbGllbnQudXJsID09PSB1cmwgJiYgXCJmb2N1c1wiIGluIGNsaWVudCkge1xyXG4gICAgICAgICAgcmV0dXJuIGNsaWVudC5mb2N1cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBJZiBub3Qgb3Blbiwgb3BlbiBpdFxyXG4gICAgICBpZiAoY2xpZW50cy5vcGVuV2luZG93KSB7XHJcbiAgICAgICAgcmV0dXJuIGNsaWVudHMub3BlbldpbmRvdyh1cmwpO1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICk7XHJcbn0pO1xyXG5cclxuLy8gTGlzdGVuIGZvciBub3RpZmljYXRpb24gY2xvc2Vcclxuc2VsZi5hZGRFdmVudExpc3RlbmVyKFwibm90aWZpY2F0aW9uY2xvc2VcIiwgKGV2ZW50KSA9PiB7XHJcbiAgY29uc29sZS5sb2coXCJbU1ddIE5vdGlmaWNhdGlvbiBjbG9zZWQ6XCIsIGV2ZW50Lm5vdGlmaWNhdGlvbik7XHJcbn0pO1xyXG4iXSwibmFtZXMiOlsiUFJFQ0FDSEVfTUFOSUZFU1QiLCJzZWxmIiwiX19XQl9NQU5JRkVTVCIsImdldElPU1ZlcnNpb24iLCJtYXRjaCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsInBhcnNlSW50IiwiaW9zVmVyc2lvbiIsInN1cHBvcnRzSU9TUHVzaCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImNvbnNvbGUiLCJsb2ciLCJkYXRhIiwianNvbiIsIm9wdGlvbnMiLCJib2R5IiwiaWNvbiIsImJhZGdlIiwidGFnIiwidGFza0lkIiwicmVxdWlyZUludGVyYWN0aW9uIiwiYWN0aW9ucyIsImFjdGlvbiIsInRpdGxlIiwid2FpdFVudGlsIiwicmVnaXN0cmF0aW9uIiwic2hvd05vdGlmaWNhdGlvbiIsImVycm9yIiwidGV4dCIsIm5vdGlmaWNhdGlvbiIsImNsb3NlIiwidXJsIiwiY2xpZW50cyIsIm1hdGNoQWxsIiwidHlwZSIsInRoZW4iLCJjbGllbnRMaXN0IiwiY2xpZW50IiwiZm9jdXMiLCJvcGVuV2luZG93Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./public/sw-custom.js\n"));

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