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

eval(__webpack_require__.ts("// Workbox precaching manifest - injected by next-pwa\nconst PRECACHE_MANIFEST = [] || [];\n// Listen for push events\nself.addEventListener(\"push\", (event)=>{\n    console.log(\"[SW] Push event received:\", event);\n    if (!event.data) {\n        console.log(\"[SW] No push data\");\n        return;\n    }\n    try {\n        var _data_data;\n        const data = event.data.json();\n        console.log(\"[SW] Push notification data:\", data);\n        const options = {\n            body: data.body || \"New notification\",\n            icon: data.icon || \"/header-logo.png\",\n            badge: data.badge || \"/favicon.ico\",\n            data: data.data || {},\n            tag: ((_data_data = data.data) === null || _data_data === void 0 ? void 0 : _data_data.taskId) || \"notification\",\n            requireInteraction: false,\n            actions: [\n                {\n                    action: \"open\",\n                    title: \"Open\"\n                },\n                {\n                    action: \"close\",\n                    title: \"Close\"\n                }\n            ]\n        };\n        event.waitUntil(self.registration.showNotification(data.title || \"MetroMac\", options));\n    } catch (error) {\n        console.error(\"[SW] Error parsing push data:\", error);\n        // Fallback: show notification with raw data\n        event.waitUntil(self.registration.showNotification(\"MetroMac Notification\", {\n            body: event.data.text ? event.data.text() : \"New notification\",\n            icon: \"/header-logo.png\"\n        }));\n    }\n});\n// Listen for notification clicks\nself.addEventListener(\"notificationclick\", (event)=>{\n    var _event_notification_data;\n    console.log(\"[SW] Notification clicked:\", event.notification);\n    event.notification.close();\n    const taskId = (_event_notification_data = event.notification.data) === null || _event_notification_data === void 0 ? void 0 : _event_notification_data.taskId;\n    const url = taskId ? \"/dashboard/tasks/view?id=\".concat(taskId) : \"/dashboard\";\n    event.waitUntil(clients.matchAll({\n        type: \"window\"\n    }).then((clientList)=>{\n        // Check if app is already open\n        for (let client of clientList){\n            if (client.url === url && \"focus\" in client) {\n                return client.focus();\n            }\n        }\n        // If not open, open it\n        if (clients.openWindow) {\n            return clients.openWindow(url);\n        }\n    }));\n});\n// Listen for notification close\nself.addEventListener(\"notificationclose\", (event)=>{\n    console.log(\"[SW] Notification closed:\", event.notification);\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wdWJsaWMvc3ctY3VzdG9tLmpzIiwibWFwcGluZ3MiOiJBQUFBLHFEQUFxRDtBQUNyRCxNQUFNQSxvQkFBb0JDLEtBQUtDLGFBQWEsSUFBSSxFQUFFO0FBRWxELHlCQUF5QjtBQUN6QkQsS0FBS0UsZ0JBQWdCLENBQUMsUUFBUSxDQUFDQztJQUM3QkMsUUFBUUMsR0FBRyxDQUFDLDZCQUE2QkY7SUFFekMsSUFBSSxDQUFDQSxNQUFNRyxJQUFJLEVBQUU7UUFDZkYsUUFBUUMsR0FBRyxDQUFDO1FBQ1o7SUFDRjtJQUVBLElBQUk7WUFTS0M7UUFSUCxNQUFNQSxPQUFPSCxNQUFNRyxJQUFJLENBQUNDLElBQUk7UUFDNUJILFFBQVFDLEdBQUcsQ0FBQyxnQ0FBZ0NDO1FBRTVDLE1BQU1FLFVBQVU7WUFDZEMsTUFBTUgsS0FBS0csSUFBSSxJQUFJO1lBQ25CQyxNQUFNSixLQUFLSSxJQUFJLElBQUk7WUFDbkJDLE9BQU9MLEtBQUtLLEtBQUssSUFBSTtZQUNyQkwsTUFBTUEsS0FBS0EsSUFBSSxJQUFJLENBQUM7WUFDcEJNLEtBQUtOLEVBQUFBLGFBQUFBLEtBQUtBLElBQUksY0FBVEEsaUNBQUFBLFdBQVdPLE1BQU0sS0FBSTtZQUMxQkMsb0JBQW9CO1lBQ3BCQyxTQUFTO2dCQUNQO29CQUNFQyxRQUFRO29CQUNSQyxPQUFPO2dCQUNUO2dCQUNBO29CQUNFRCxRQUFRO29CQUNSQyxPQUFPO2dCQUNUO2FBQ0Q7UUFDSDtRQUVBZCxNQUFNZSxTQUFTLENBQ2JsQixLQUFLbUIsWUFBWSxDQUFDQyxnQkFBZ0IsQ0FBQ2QsS0FBS1csS0FBSyxJQUFJLFlBQVlUO0lBRWpFLEVBQUUsT0FBT2EsT0FBTztRQUNkakIsUUFBUWlCLEtBQUssQ0FBQyxpQ0FBaUNBO1FBRS9DLDRDQUE0QztRQUM1Q2xCLE1BQU1lLFNBQVMsQ0FDYmxCLEtBQUttQixZQUFZLENBQUNDLGdCQUFnQixDQUFDLHlCQUF5QjtZQUMxRFgsTUFBTU4sTUFBTUcsSUFBSSxDQUFDZ0IsSUFBSSxHQUFHbkIsTUFBTUcsSUFBSSxDQUFDZ0IsSUFBSSxLQUFLO1lBQzVDWixNQUFNO1FBQ1I7SUFFSjtBQUNGO0FBRUEsaUNBQWlDO0FBQ2pDVixLQUFLRSxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQ0M7UUFJM0JBO0lBSGZDLFFBQVFDLEdBQUcsQ0FBQyw4QkFBOEJGLE1BQU1vQixZQUFZO0lBQzVEcEIsTUFBTW9CLFlBQVksQ0FBQ0MsS0FBSztJQUV4QixNQUFNWCxVQUFTViwyQkFBQUEsTUFBTW9CLFlBQVksQ0FBQ2pCLElBQUksY0FBdkJILCtDQUFBQSx5QkFBeUJVLE1BQU07SUFDOUMsTUFBTVksTUFBTVosU0FBUyw0QkFBbUMsT0FBUEEsVUFBVztJQUU1RFYsTUFBTWUsU0FBUyxDQUNiUSxRQUNHQyxRQUFRLENBQUM7UUFBRUMsTUFBTTtJQUFTLEdBQzFCQyxJQUFJLENBQUMsQ0FBQ0M7UUFDTCwrQkFBK0I7UUFDL0IsS0FBSyxJQUFJQyxVQUFVRCxXQUFZO1lBQzdCLElBQUlDLE9BQU9OLEdBQUcsS0FBS0EsT0FBTyxXQUFXTSxRQUFRO2dCQUMzQyxPQUFPQSxPQUFPQyxLQUFLO1lBQ3JCO1FBQ0Y7UUFDQSx1QkFBdUI7UUFDdkIsSUFBSU4sUUFBUU8sVUFBVSxFQUFFO1lBQ3RCLE9BQU9QLFFBQVFPLFVBQVUsQ0FBQ1I7UUFDNUI7SUFDRjtBQUVOO0FBRUEsZ0NBQWdDO0FBQ2hDekIsS0FBS0UsZ0JBQWdCLENBQUMscUJBQXFCLENBQUNDO0lBQzFDQyxRQUFRQyxHQUFHLENBQUMsNkJBQTZCRixNQUFNb0IsWUFBWTtBQUM3RCIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9wdWJsaWMvc3ctY3VzdG9tLmpzPzc5N2MiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gV29ya2JveCBwcmVjYWNoaW5nIG1hbmlmZXN0IC0gaW5qZWN0ZWQgYnkgbmV4dC1wd2FcclxuY29uc3QgUFJFQ0FDSEVfTUFOSUZFU1QgPSBzZWxmLl9fV0JfTUFOSUZFU1QgfHwgW107XHJcblxyXG4vLyBMaXN0ZW4gZm9yIHB1c2ggZXZlbnRzXHJcbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcigncHVzaCcsIChldmVudCkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKCdbU1ddIFB1c2ggZXZlbnQgcmVjZWl2ZWQ6JywgZXZlbnQpO1xyXG5cclxuICBpZiAoIWV2ZW50LmRhdGEpIHtcclxuICAgIGNvbnNvbGUubG9nKCdbU1ddIE5vIHB1c2ggZGF0YScpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGRhdGEgPSBldmVudC5kYXRhLmpzb24oKTtcclxuICAgIGNvbnNvbGUubG9nKCdbU1ddIFB1c2ggbm90aWZpY2F0aW9uIGRhdGE6JywgZGF0YSk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgYm9keTogZGF0YS5ib2R5IHx8ICdOZXcgbm90aWZpY2F0aW9uJyxcclxuICAgICAgaWNvbjogZGF0YS5pY29uIHx8ICcvaGVhZGVyLWxvZ28ucG5nJyxcclxuICAgICAgYmFkZ2U6IGRhdGEuYmFkZ2UgfHwgJy9mYXZpY29uLmljbycsXHJcbiAgICAgIGRhdGE6IGRhdGEuZGF0YSB8fCB7fSxcclxuICAgICAgdGFnOiBkYXRhLmRhdGE/LnRhc2tJZCB8fCAnbm90aWZpY2F0aW9uJyxcclxuICAgICAgcmVxdWlyZUludGVyYWN0aW9uOiBmYWxzZSxcclxuICAgICAgYWN0aW9uczogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIGFjdGlvbjogJ29wZW4nLFxyXG4gICAgICAgICAgdGl0bGU6ICdPcGVuJyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGFjdGlvbjogJ2Nsb3NlJyxcclxuICAgICAgICAgIHRpdGxlOiAnQ2xvc2UnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9O1xyXG5cclxuICAgIGV2ZW50LndhaXRVbnRpbChcclxuICAgICAgc2VsZi5yZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbihkYXRhLnRpdGxlIHx8ICdNZXRyb01hYycsIG9wdGlvbnMpXHJcbiAgICApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdbU1ddIEVycm9yIHBhcnNpbmcgcHVzaCBkYXRhOicsIGVycm9yKTtcclxuICAgIFxyXG4gICAgLy8gRmFsbGJhY2s6IHNob3cgbm90aWZpY2F0aW9uIHdpdGggcmF3IGRhdGFcclxuICAgIGV2ZW50LndhaXRVbnRpbChcclxuICAgICAgc2VsZi5yZWdpc3RyYXRpb24uc2hvd05vdGlmaWNhdGlvbignTWV0cm9NYWMgTm90aWZpY2F0aW9uJywge1xyXG4gICAgICAgIGJvZHk6IGV2ZW50LmRhdGEudGV4dCA/IGV2ZW50LmRhdGEudGV4dCgpIDogJ05ldyBub3RpZmljYXRpb24nLFxyXG4gICAgICAgIGljb246ICcvaGVhZGVyLWxvZ28ucG5nJyxcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIExpc3RlbiBmb3Igbm90aWZpY2F0aW9uIGNsaWNrc1xyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ25vdGlmaWNhdGlvbmNsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgY29uc29sZS5sb2coJ1tTV10gTm90aWZpY2F0aW9uIGNsaWNrZWQ6JywgZXZlbnQubm90aWZpY2F0aW9uKTtcclxuICBldmVudC5ub3RpZmljYXRpb24uY2xvc2UoKTtcclxuXHJcbiAgY29uc3QgdGFza0lkID0gZXZlbnQubm90aWZpY2F0aW9uLmRhdGE/LnRhc2tJZDtcclxuICBjb25zdCB1cmwgPSB0YXNrSWQgPyBgL2Rhc2hib2FyZC90YXNrcy92aWV3P2lkPSR7dGFza0lkfWAgOiAnL2Rhc2hib2FyZCc7XHJcblxyXG4gIGV2ZW50LndhaXRVbnRpbChcclxuICAgIGNsaWVudHNcclxuICAgICAgLm1hdGNoQWxsKHsgdHlwZTogJ3dpbmRvdycgfSlcclxuICAgICAgLnRoZW4oKGNsaWVudExpc3QpID0+IHtcclxuICAgICAgICAvLyBDaGVjayBpZiBhcHAgaXMgYWxyZWFkeSBvcGVuXHJcbiAgICAgICAgZm9yIChsZXQgY2xpZW50IG9mIGNsaWVudExpc3QpIHtcclxuICAgICAgICAgIGlmIChjbGllbnQudXJsID09PSB1cmwgJiYgJ2ZvY3VzJyBpbiBjbGllbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5mb2N1cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJZiBub3Qgb3Blbiwgb3BlbiBpdFxyXG4gICAgICAgIGlmIChjbGllbnRzLm9wZW5XaW5kb3cpIHtcclxuICAgICAgICAgIHJldHVybiBjbGllbnRzLm9wZW5XaW5kb3codXJsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgKTtcclxufSk7XHJcblxyXG4vLyBMaXN0ZW4gZm9yIG5vdGlmaWNhdGlvbiBjbG9zZVxyXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ25vdGlmaWNhdGlvbmNsb3NlJywgKGV2ZW50KSA9PiB7XHJcbiAgY29uc29sZS5sb2coJ1tTV10gTm90aWZpY2F0aW9uIGNsb3NlZDonLCBldmVudC5ub3RpZmljYXRpb24pO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbIlBSRUNBQ0hFX01BTklGRVNUIiwic2VsZiIsIl9fV0JfTUFOSUZFU1QiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJjb25zb2xlIiwibG9nIiwiZGF0YSIsImpzb24iLCJvcHRpb25zIiwiYm9keSIsImljb24iLCJiYWRnZSIsInRhZyIsInRhc2tJZCIsInJlcXVpcmVJbnRlcmFjdGlvbiIsImFjdGlvbnMiLCJhY3Rpb24iLCJ0aXRsZSIsIndhaXRVbnRpbCIsInJlZ2lzdHJhdGlvbiIsInNob3dOb3RpZmljYXRpb24iLCJlcnJvciIsInRleHQiLCJub3RpZmljYXRpb24iLCJjbG9zZSIsInVybCIsImNsaWVudHMiLCJtYXRjaEFsbCIsInR5cGUiLCJ0aGVuIiwiY2xpZW50TGlzdCIsImNsaWVudCIsImZvY3VzIiwib3BlbldpbmRvdyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./public/sw-custom.js\n"));

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