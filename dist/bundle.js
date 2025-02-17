!function(){"use strict";window._INTERCEPT||(window._INTERCEPT={INTERCEPTED:!1,USE_INTERCEPT:!1,intercepted:[],timeout:3e4,timeoutReject:!0,countdownInterval:void 0}),window._INTERCEPT.handleIntercept=async t=>{try{const n=JSON.parse(t);if(n.d,"rollresult"===n.d?.b?.d?.type)return await e(n,"rollresult");if("general"===n.d?.b?.d?.type)return n?.d?.b?.d?.inlinerolls?await e(n,"inlinerolls"):await e(n,"other")}catch(t){return console.log("handleIntercept",t),!0}return!0;function e(t,e){const n=Date.now()+window._INTERCEPT.timeout;return new Promise((i=>{let o=function(t){try{return btoa(JSON.stringify(t)).replace(/[/+=]/g,"")}catch(t){return!1}}(t.d.b.d);if(!o)return i(!0);const l=setTimeout((()=>{window._INTERCEPT.timeoutReject?r():a()}),window._INTERCEPT.timeout),r=()=>{clearTimeout(l),window._INTERCEPT.intercepted=window._INTERCEPT.intercepted.filter((t=>t.id!==o)),window._INTERCEPT.displayRolls(),i(!1)},a=()=>{clearTimeout(l),window._INTERCEPT.intercepted=window._INTERCEPT.intercepted.filter((t=>t.id!==o)),window._INTERCEPT.displayRolls(),i(!0)};let d={};try{d=JSON.parse(t.d.b.d?.content.trim())}catch(t){}window._INTERCEPT.intercepted.push({type:e,id:o,data:t.d.b.d,content:d,continue:a,reject:r,expire:n,timer:l}),window._INTERCEPT.displayRolls()}))}},window._INTERCEPT.displayRolls=async()=>{const t=$("#displayRolls");t.empty(),window._INTERCEPT.intercepted.forEach(((e,n)=>{let i="";if("rollresult"===e.type)i=`${e.content.total}`;else if("inlinerolls"===e.type){let t=[];for(const n in e.data.inlinerolls){let i=e.data.inlinerolls[n];i.signature&&t.push(i.results.total)}i=`${JSON.stringify(t)}`}else"mancerdata"===e.type?i="Mancer Data":console.log("item",e);const o=$(`\n         <li style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0;">\n            <button class="btn btn-danger btn-reject" data-index="${n}">Reject</button>\n            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">\n               <span>${i}</span>\n               <span class="countdown" data-expire="${e.expire}" style="color: #666; font-size: 0.9em;"></span>\n            </div>\n            <button class="btn btn-success btn-accept" data-index="${n}" style="margin-left: 8px;">Accept</button>\n         </li>\n      `);t.append(o)})),t.find(".btn-reject").off("click").on("click",(function(){const t=$(this).data("index");window._INTERCEPT.intercepted[t].reject()})),t.find(".btn-accept").off("click").on("click",(function(){const t=$(this).data("index");window._INTERCEPT.intercepted[t].continue()})),window._INTERCEPT.updateCountdowns()},window._INTERCEPT.updateCountdowns=()=>{$(".countdown").each((function(){const t=$(this),e=parseInt(t.data("expire"))-Date.now();if(e<=0)t.text("Expired!");else{const n=Math.floor(e/1e3);t.text(`${n}s`)}}))},window._INTERCEPT.enable=()=>{window._INTERCEPT.USE_INTERCEPT=!0},window._INTERCEPT.disable=()=>{window._INTERCEPT.USE_INTERCEPT=!1},window._INTERCEPT.intercept=()=>{if(window._INTERCEPT.INTERCEPTED)return;window._INTERCEPT.INTERCEPTED=!0;const t=window.WebSocket.prototype.send;window.WebSocket.prototype.send=async function(e){if(!window._INTERCEPT.USE_INTERCEPT)return t.call(this,e);try{if(!await window._INTERCEPT.handleIntercept(e))return;return t.call(this,e)}catch(n){return console.log("intercept error",n),t.call(this,e)}}},window._INTERCEPT.initialize=()=>{window._INTERCEPT.intercept(),$(".r20-draggable-element").remove(),clearInterval(window._INTERCEPT.countdownInterval),window._INTERCEPT.countdownInterval=setInterval(window._INTERCEPT.updateCountdowns,1e3);let t=$("body").append('<div\r\n\tclass="ui-dialog ui-widget ui-widget-content r20-draggable-element ui-corner-all initiativedialog ui-draggable ui-resizable ui-dialog-buttons"\r\n\tstyle="position: fixed !important; top: 50%; left: 50%; z-index: 20000 !important"\r\n>\r\n\t<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix ui-draggable-handle">\r\n\t\t<span id="ui-id-10" class="ui-dialog-title">Role Capture</span>\r\n\t\t<a href="#" class="ui-dialog-titlebar-close ui-corner-all r20-deleteSelf" role="button">\r\n\t\t\t<span class="ui-icon ui-icon-closethick">close</span>\r\n\t\t</a>\r\n\t</div>\r\n\t<p style="max-height: 500px; overflow: auto"><span id="displayRolls"></span></p>\r\n\t<li style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0">\r\n\t\t<button class="btn btn-danger rejectAll" style="margin-left: 8px">Reject All</button>\r\n\t\t<button class="btn btn-danger" id="toggle-intercept" type="button">Disabled</button>\r\n\t\t<button class="btn btn-success acceptAll" style="margin-right: 8px">Accept All</button>\r\n\t</li>\r\n</div>\r\n'),e=$(t);e.find("#toggle-intercept").text(window._INTERCEPT.USE_INTERCEPT?"Enabled":"Disabled"),e.find("#toggle-intercept").off("click").on("click",(function(){window._INTERCEPT.USE_INTERCEPT=!window._INTERCEPT.USE_INTERCEPT,$(this).text(window._INTERCEPT.USE_INTERCEPT?"Enabled":"Disabled")})),e.find(".r20-draggable-element").draggable({containment:"window",handle:!1,scroll:!1}),e.find(".r20-deleteSelf").on("click",(function(){$(this).closest(".r20-draggable-element").remove()})),e.find(".rejectAll").on("click",(function(){window._INTERCEPT.intercepted.forEach(((t,e)=>{t.reject()}))})),e.find(".acceptAll").on("click",(function(){window._INTERCEPT.intercepted.forEach(((t,e)=>{t.continue()}))}))},window._INTERCEPT.initialize()}();
