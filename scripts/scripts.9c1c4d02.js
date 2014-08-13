"use strict";var app=angular.module("b2gQaDashboardApp",["ngAnimate","ngRoute","ngSanitize","ui.bootstrap","elasticsearch","angularChart","services","constants"]);app.config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html"}).otherwise({redirectTo:"/"})}]),app.config(["$httpProvider",function(a){a.defaults.useXDomain=!0,delete a.defaults.headers.common["X-Requested-With"]}]),angular.module("constants",[]).constant("ONE_WEEK",6048e5),angular.module("constants").constant("AGE_RANGES",[0,2,4]),angular.module("config",[]).constant("config",{databases:{bugs:{host:"https://esfrontline.bugzilla.mozilla.org",index:"public_bugs",type:"bug_version"}},bugtracker:{host:"https://bugzilla.mozilla.org/"}}),angular.module("b2gQaDashboardApp").factory("weeklyChartCommons",["config","ONE_WEEK","filters",function(a,b,c){function d(a){var b=new Date(a),c=b.getDate()-b.getDay();return b.setDate(c),b.setHours(0),b.setMinutes(0),b.setSeconds(0),b.setMilliseconds(0),+b}function e(a){var b=0;for(var c in a){var d=a[c];if(!d.hasEverBeenResolved()){b=g;break}b<d.lastResolvedOn&&(b=d.lastResolvedOn)}return b}function f(a){var c=g,f=e(a);return f!==g&&(c=d(f)+b),c}var g=Date.now(),h={};return h.initializeDataset=function(){return{schema:[{name:"weekDay",type:"datetime",format:" "}],records:[]}},h.initializeOptions=function(){return{rows:[],xAxis:{name:"weekDay",displayFormat:"%Y-%m-%d"},subchart:{show:!0}}},h.generateSortedResultsAndUpdateChart=function(a,b,c){h.clearChart(a.chartData),a.sortedResults=h.buildSortedResults(a.filteredResults,c),h.buildChart(a.sortedResults,a.chartData,a.chartOptions,b)},h.clearChart=function(a){a.records.length=0},h.buildSortedResults=function(a,c){for(var e={},g=a[Object.keys(a)[0]]||{},h=d(g.createdOn),i=f(a);i>=h;)e[h]=c(h),h+=b;return e},h.buildChart=function(a,b,c,d){d.forEach(function(a){c.rows.push({name:a,type:"bar"})}),Object.keys(a).forEach(function(c){var e=parseInt(c),f={weekDay:new Date(e)};d.forEach(function(b){f[b]=a[e][b].length}),b.records.push(f)})},h.onclick=function(a,b){var d=+a.x,e=a.name;c.selected.bugsIds=b.sortedResults[d][e],b.$apply()},h.linkColors=function(a,b){var c={},d=0;return a.forEach(function(a){c[a]=b[d],d++}),c},h}]),angular.module("b2gQaDashboardApp").controller("GoToBugzillaCtrl",["$scope","bugzilla",function(a,b){a.go=function(){var c=[];for(var d in a.filteredResults){var e=a.filteredResults[d];c.push(e.id)}b.open(c)}}]),angular.module("b2gQaDashboardApp").service("filters",function(){function a(){var a={};for(var b in e)a[b]=e[b][0];return a}function b(){f.blockingB2G=e.blockingB2G[0],f.bugsIds=[]}function c(a,b){"undefined"==typeof e[a]&&(e[a]=[]);var c=!1;e[a].some(function(a){return c=a.name===b.name}),c||e[a].push(b)}function d(a){var b=a.slice(-1);return-1===["+","?"].indexOf(b)?a:a.slice(0,-1)}var e={blockingB2G:[{name:"- All -",value:""}],bugsIds:[[]]},f=a(),g=function(a){for(var b in a){var e=a[b],f=d(e.blockingB2G),g={name:f,value:f};c("blockingB2G",g)}};return{available:e,selected:f,generateAvailable:g,clearSelected:b}}),angular.module("b2gQaDashboardApp").controller("VersionFilterCtrl",["$scope","filters",function(a,b){a.availableFilters=b.available,a.selectedFilters=b.selected,a.setFilter=function(a){b.selected.blockingB2G=a}}]),angular.module("b2gQaDashboardApp").controller("BugsIdsFilterCtrl",["$scope","filters",function(a,b){a.availableFilters=b.available,a.selectedFilters=b.selected,a.$watch("bugsIds",function(b,c){if("undefined"!=typeof b){var d=b.split(","),e=[],f=!1;d.some(function(a){var b=parseInt(a);return isNaN(a)||isNaN(b)?""!==a&&(f=!0):e.push(b),f}),f?a.bugsIds=c:a.selectedFilters.bugsIds=e}}),a.$watchCollection("selectedFilters.bugsIds",function(){"undefined"!=typeof a.selectedFilters.bugsIds&&(a.bugsIds=a.selectedFilters.bugsIds.join(", "))})}]),angular.module("b2gQaDashboardApp").controller("ClearFiltersCtrl",["$scope","filters",function(a,b){a.clear=function(){b.clearSelected()}}]),angular.module("b2gQaDashboardApp").controller("SmoketestsCtrl",["$scope","config","SmoketestsBugsRequest","filters",function(a,b,c,d){function e(b){b.execute().then(function(){a.smoketests=b.results,a.filteredResults=a.smoketests,d.generateAvailable(a.smoketests)})}function f(){var b=a.selectedFilters.blockingB2G.value.toLowerCase();a.filteredResults={};for(var c in a.smoketests){var d=a.smoketests[c];-1!==d.blockingB2G.indexOf(b)&&(a.filteredResults[c]=d),a.selectedFilters.bugsIds.length>0&&-1===a.selectedFilters.bugsIds.indexOf(d.id)&&delete a.filteredResults[c]}}a.smoketests={},a.filteredResults={},a.selectedFilters=d.selected,e(new c),a.$watchCollection("selectedFilters",f),a.filter=function(a){d.selected.bugsIds=[a.id]}}]),angular.module("b2gQaDashboardApp").controller("SmoketestsOpenResolvedCtrl",["$scope","weeklyChartCommons",function(a,b){function c(b){var c={};d.forEach(function(a){c[a]=[]});for(var e in a.filteredResults){var f=a.filteredResults[e];f.wasOpenDuringWeek(b)&&c[d[0]].push(f.id),f.hasBeenResolvedDuringWeek(b)&&c[d[1]].push(f.id)}return c}var d=["Open","Resolved"];a.chartData=b.initializeDataset(),a.chartOptions=b.initializeOptions(),a.chartOptions.onclick=function(c){b.onclick(c,a)},a.chartOptions.colors=b.linkColors(d,["orange","green"]),a.$watch("filteredResults",function(){b.generateSortedResultsAndUpdateChart(a,d,c)})}]),angular.module("b2gQaDashboardApp").controller("SmoketestsAgeCtrl",["$scope","IntervalsObject","AGE_RANGES","weeklyChartCommons",function(a,b,c,d){function e(d){var e=new b(c);for(var f in a.filteredResults){var g=a.filteredResults[f];if(g.wasOpenDuringWeek(d)){var h=g.getAgeInDaysAt(d);e.addContent(h,g.id)}}return e}var f=Object.keys(new b(c));a.chartData=d.initializeDataset(),a.chartOptions=d.initializeOptions(),a.chartOptions.onclick=function(b){d.onclick(b,a)},a.chartOptions.groups=[f],a.chartOptions.colors=d.linkColors(f,["green","orange","red"]),a.$watch("filteredResults",function(){d.generateSortedResultsAndUpdateChart(a,f,e)})}]),angular.module("models",[]),angular.module("models").factory("Bug",["ONE_WEEK",function(a){var b=-1,c="nobody@mozilla.org",d=function(a,d,e,f,g,h,i,j,k,l,m,n){this.id=a||0,this.summary=d||"",this.product=e||"",this.component=f||"",this.status=g||"unconfirmed",this.resolution=h||"---",this.createdOn=i||b,this.lastResolvedOn=j||b,this.keywords=k||[],this.blockingB2G=l||"---",this.assignedTo=m||c,this.expiresOn=n||9999999999e3,this.status="new"===this.status&&this.assignedTo!==c?"assigned":this.status};return d.prototype.wasOpenDuringWeek=function(b){var c=b-a;return this.hasBeenCreatedSince(b)&&!this.hasBeenResolvedSince(c)},d.prototype.hasBeenResolvedDuringWeek=function(b){var c=b-a;return this.hasBeenResolvedSince(b)&&!this.hasBeenResolvedSince(c)},d.prototype.hasBeenCreatedSince=function(a){return this.createdOn<=a},d.prototype.hasBeenResolvedSince=function(a){return this.hasEverBeenResolved()&&this.lastResolvedOn<=a},d.prototype.getAgeInDaysAt=function(a){var b=this.hasBeenResolvedSince(a)?this.lastResolvedOn-this.createdOn:a-this.createdOn;return Math.round(b/864e5)},d.prototype.getAgeInDays=function(){return this.getAgeInDaysAt(Date.now())},d.prototype.hasEverBeenResolved=function(){return this.lastResolvedOn>b},d}]),angular.module("models").factory("IntervalsObject",function(){function a(a,b){var c=a[b];return c+=b===a.length-1?"+":"-"+a[b+1]}function b(a){var b=a.split("-"),c=b[0].replace("+","")||0,d=b[1]||Number.POSITIVE_INFINITY;return[c,d]}var c=function(b){for(var c=0;c<b.length;c++){var d=a(b,c);this[d]=[]}};return c.prototype.addContent=function(a,c){for(var d in this){var e=b(d),f=e[0],g=e[1];a>=f&&g>a&&this[d].push(c)}},c}),angular.module("services",["constants","config","models"]),angular.module("services").factory("bugzilla",["config",function(a){var b={};return b.open=function(b){var c=1===b.length?"show_bug.cgi?id=":"buglist.cgi?bug_id=";window.open(a.bugtracker.host+c+b.join("%2C"))},b}]),angular.module("services").factory("Base",["config","$q",function(a,b){function c(a,b,c){return this.index=a||"",this.type=b||"",this.body=c||{},this.results=[],this}return c.prototype.execute=function(){var c=this,d=a.databases.bugs.host+"/"+this.index+"/"+this.type+"/_search",e=b.defer(),f=new XMLHttpRequest;return f.open("POST",d),f.onload=function(){var a=JSON.parse(f.response),b=[];a.hits.hits.forEach(function(a){b.push(a._source)}),c.results=b,e.resolve(a)},f.send(JSON.stringify(this.body)),e.promise},c}]),angular.module("services").factory("BugsRequest",["Base","config","Bug",function(a,b,c){function d(){return a.apply(this,arguments),this.index=b.databases.bugs.index,this.type=b.databases.bugs.type,this.body={sort:[{bug_id:{order:"asc"}}],query:{filtered:{query:{match_all:{}},filter:{and:[{range:{expires_on:{gte:Date.now()}}}]}}},from:0,size:2e5},this}return d.prototype=new a,d.prototype.execute=function(){var b=this,d=a.prototype.execute.apply(this,arguments);return d.then(function(a){var d={};return b.results.forEach(function(a){d[a.bug_id]=new c(a.bug_id,a.short_desc,a.product,a.component,a.bug_status,a.resolution,a.created_ts,a.cf_last_resolved,a.keywords,a.cf_blocking_b2g,a.assigned_to,a.expires_on)}),b.results=d,a})},d}]),angular.module("services").factory("SmoketestsBugsRequest",["BugsRequest",function(a){function b(){return a.apply(this,arguments),this.body.query.filtered.filter.and.push({term:{keywords:"smoketest"}},{exists:{field:"cf_blocking_b2g"}},{not:{terms:{cf_blocking_b2g:["---","-"]}}}),this}return b.prototype=new a,b}]),angular.module("services").service("elasticsearch",["esFactory","config",function(a,b){return a({host:b.databases.bugs.host})}]);