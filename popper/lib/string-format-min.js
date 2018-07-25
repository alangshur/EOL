(function(e){"use strict";function p(t){var n=new Error(t);return n.name="ValueError",n}function i(a){return function(t){
var c=Array.prototype.slice.call(arguments,1),f=0,l="UNDEFINED";return t.replace(/([{}])\1|[{](.*?)(?:!(.+?))?[}]/g,
function(t,n,r,e){if(null!=n)return n;var i=r;if(0<i.length){if("IMPLICIT"===l)
throw p("cannot switch from implicit to explicit numbering");l="EXPLICIT"}else{if("EXPLICIT"===l)
throw p("cannot switch from explicit to implicit numbering");l="IMPLICIT",i=String(f),f+=1}var o=i.split("."),
u=(/^\d+$/.test(o[0])?o:["0"].concat(o)).reduce(function(t,r){return t.reduce(function(t,n){
return null!=n&&r in Object(n)?["function"==typeof n[r]?n[r]():n[r]]:[]},[])},[c]).reduce(function(t,n){return n},"");
if(null==e)return u;if(Object.prototype.hasOwnProperty.call(a,e))return a[e](u);throw p('no transformer named "'+e+'"')})}}
var t=i({});return t.create=i,t.extend=function(t,n){var r=i(n);t.format=function(){var t=Array.prototype.slice.call(arguments);
return t.unshift(this),r.apply(e,t)}},"undefined"!=typeof module?module.exports=t:"function"==typeof define&&
define.amd?define(function(){return t}):e.format=t,t}).call(this,this);