require=function o(s,c,r){function l(t,e){if(!c[t]){if(!s[t]){var a="function"==typeof require&&require;if(!e&&a)return a(t,!0);if(m)return m(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var i=c[t]={exports:{}};s[t][0].call(i.exports,function(e){return l(s[t][1][e]||e)},i,i.exports,o,s,c,r)}return c[t].exports}for(var m="function"==typeof require&&require,e=0;e<r.length;e++)l(r[e]);return l}({AboveGameView:[function(e,t,a){"use strict";cc._RF.push(t,"d5fe2lVraFI9oPk+mQnMkSu","AboveGameView"),cc.Class({extends:cc.Component,properties:{aboveLabel:cc.Node,avaterSprite:cc.Node,nameLabel:cc.Node,scoreLabel:cc.Node},loadRank:function(e,t,a){console.log(e,t,a);for(var n=null,i=0;i<e.length;i++){var o=e[i],s=this.getMaxScore(o);if(1!=o.my){if(s<a)break;n=o}}null==n?(this.aboveLabel.getComponent(cc.Label).string="无人可挡",this.loadImage(this.avaterSprite,t.avatarUrl),this.nameLabel.getComponent(cc.Label).string=t.nickname,this.scoreLabel.getComponent(cc.Label).string=a):(this.aboveLabel.getComponent(cc.Label).string="即将超越",this.loadImage(this.avaterSprite,n.avatarUrl),this.nameLabel.getComponent(cc.Label).string=n.nickname,this.scoreLabel.getComponent(cc.Label).string=this.getMaxScore(n))},loadImage:function(a,e){cc.loader.load({url:e,type:"png"},function(e,t){a.getComponent(cc.Sprite).spriteFrame=new cc.SpriteFrame(t)})},getMaxScore:function(e){for(var t=0;t<e.KVDataList.length;t++){var a=e.KVDataList[t];if("maxScore"==a.key)return parseInt(a.value)}return 0}}),cc._RF.pop()},{}],FinishGameRank:[function(e,t,a){"use strict";cc._RF.push(t,"4b762SIRG5MH6Vx82JIm+ng","FinishGameRank"),cc.Class({extends:cc.Component,properties:{rankNodes:{type:cc.Node,default:[]}},loadRank:function(e){for(var t=0;t<e.length;t++){var a=e[t],n=this.rankNodes[t];n.getChildByName("rankLabel").getComponent(cc.Label).string=a.rank,n.getChildByName("nameLabel").getComponent(cc.Label).string=a.nickname;for(var i=n.getChildByName("scoreLabel").getComponent(cc.Label).string=0;i<a.KVDataList.length;i++){var o=a.KVDataList[i];"maxScore"==o.key&&(n.getChildByName("scoreLabel").getComponent(cc.Label).string=o.value)}1==a.my&&(n.getChildByName("scoreLabel").color=new cc.color("#ea7d07"),n.getChildByName("rankLabel").color=new cc.color("#ea7d07"),n.getChildByName("nameLabel").color=new cc.color("#ea7d07")),this.loadImage(n,a.avatarUrl)}},loadImage:function(a,e){cc.loader.load({url:e,type:"png"},function(e,t){a.getChildByName("avatarSprite").getComponent(cc.Sprite).spriteFrame=new cc.SpriteFrame(t)})}}),cc._RF.pop()},{}],RankGameView:[function(e,t,a){"use strict";cc._RF.push(t,"21f7d//INBKD7J6aiWaUbHh","RankGameView"),cc.Class({extends:cc.Component,properties:{commonItem:cc.Node,viewScroll:cc.Node},loadRank:function(e){this.viewScroll.getComponent("ScrollView").setInitData(e);for(var t=0;t<e.length;t++){var a=e[t];if(1==a.my){this.commonItem.getComponent("RankItem").loadRank(a);break}}}}),cc._RF.pop()},{}],RankItem:[function(e,t,a){"use strict";cc._RF.push(t,"d5fd7iR+PNHBI/WRQIjsYFZ","RankItem"),cc.Class({extends:cc.Component,properties:{itemID:0,rankLabel:cc.Node,nameLabel:cc.Node,avatarSprite:cc.Node,scoreLabel:cc.Node},setItem:function(e,t){this.itemID=e,this.loadRank(t)},loadRank:function(e){console.log("loadRank start......"),this.rankLabel.getComponent(cc.Label).string=e.rank,this.nameLabel.getComponent(cc.Label).string=e.nickname;for(var t=this.scoreLabel.getComponent(cc.Label).string=0;t<e.KVDataList.length;t++){var a=e.KVDataList[t];"maxScore"==a.key&&(this.scoreLabel.getComponent(cc.Label).string=a.value)}this.loadImage(this.avatarSprite,e.avatarUrl)},loadImage:function(a,e){cc.loader.load({url:e,type:"png"},function(e,t){a.getComponent(cc.Sprite).spriteFrame=new cc.SpriteFrame(t)})}}),cc._RF.pop()},{}],ScrollView:[function(e,t,a){"use strict";cc._RF.push(t,"1c8ba0SXO5DdY97ComdNJAJ","ScrollView"),cc.Class({extends:cc.Component,properties:{itemHeight:60,firstItem:cc.Node,secondItem:cc.Node,thirdItem:cc.Node,commonItem:cc.Node,scrollView:{default:null,type:cc.ScrollView},spawnCount:0,totalCount:0,spacing:0},onLoad:function(){this.spacing=10},initialize:function(){this.content=this.scrollView.content,this.items=[],this.updateTimer=0,this.updateInterval=.2,this.itemHeight=100,this.lastContentPosY=0,this.bufferZone=this.spawnCount*(this.itemHeight+this.spacing)/2,this.content.height=this.totalCount*(this.itemHeight+this.spacing)+this.spacing;for(var e=0;e<this.spawnCount;++e){var t=null;t=0==e?cc.instantiate(this.firstItem):1==e?cc.instantiate(this.secondItem):2==e?cc.instantiate(this.thirdItem):cc.instantiate(this.commonItem),this.content.addChild(t),t.setPosition(0,-t.height*(.5+e)-this.spacing*(e+1)),t.getComponent("RankItem").setItem(e,this.data[e]),this.items.push(t)}},getPositionInView:function(e){var t=e.parent.convertToWorldSpaceAR(e.position);return this.scrollView.node.convertToNodeSpaceAR(t)},update:function(e){if(this.updateTimer+=e,!(this.updateTimer<this.updateInterval||null==this.items||this.items.length<=0)){this.updateTimer=0;for(var t=this.items,a=this.scrollView.content.y<this.lastContentPosY,n=(this.itemHeight+this.spacing)*t.length,i=0,o=0;o<t.length;++o){var s=this.getPositionInView(t[o]);if(a){if(i=t[o].y+n,s.y<-this.bufferZone&&i<0){t[o].y=i;var c=t[o].getComponent("RankItem"),r=c.itemID-t.length;c.setItem(r,this.data[r]),cc.log("prev id:"+r)}}else if(i=t[o].y-n,s.y>this.bufferZone&&i>-this.content.height){t[o].y=i;var l=t[o].getComponent("RankItem"),m=l.itemID+t.length;l.setItem(m,this.data[m]),cc.log("next id:"+m)}}this.lastContentPosY=this.scrollView.content.y}},setInitData:function(e){this.clear_scroll_data(),this.data=e,this.totalCount=e.length,this.spawnCount=14<=this.totalCount?14:this.totalCount,this.initialize()},clear_scroll_data:function(){if(null!=this.items){this.scrollView.scrollToOffset(cc.v2(0,0),.1);for(var e=0;e<this.items.length;e++){var t=this.items[e];t.removeFromParent(),t.destroy()}}}}),cc._RF.pop()},{}],WxOpenDataJS:[function(e,t,a){"use strict";cc._RF.push(t,"4874dn6l+pDyq8ZeEXOiKD3","WxOpenDataJS"),cc.Class({extends:cc.Component,properties:{finishGameRank:cc.Node,rankGmameView:cc.Node,aboveGameView:cc.Node},onLoad:function(){this.setViewVisiable(null)},start:function(){var n=this;wx.onMessage(function(a){switch(n.setViewVisiable(null),a.type){case"gameOverUIRank":wx.getFriendCloudStorage({keyList:["maxScore","maxLevel"],success:function(e){n.setViewVisiable(a.type);var t=n.sortRank(e.data);n.drawRankOverList(t,a)}});break;case"rankUIFriendRank":wx.getFriendCloudStorage({keyList:["maxScore","maxLevel"],success:function(e){n.setViewVisiable(a.type);var t=n.sortRank(e.data);n.drawRankFrientList(t,a)}});break;case"rankUIGroupRank":wx.getGroupCloudStorage({shareTicket:a.shareTicket,keyList:["maxScore","maxLevel"],success:function(e){n.setViewVisiable(a.type);var t=n.sortRank(e.data);n.drawRankFrientList(t,a)}});break;case"initFriendRank":n.setViewVisiable(a.type),n.initRankFriendCloudStorage(a);break;case"battleUIRank":n.setViewVisiable(a.type),n.drawRankList(n.rankList,a)}})},initRankFriendCloudStorage:function(e){var o=this;this.rankList=null,this.battleInit=!1,this.myRankData=null,wx.getFriendCloudStorage({keyList:["maxScore","maxLevel"],success:function(e){var i=e.data;wx.getUserInfo({openIdList:["selfOpenId"],lang:"zh_CN",success:function(e){console.log("getUserInfo success",e.data);for(var t=0;t<i.length;t++){var a=i[t];a.rank=t+1,a.my=!1,a.nickname==e.data[0].nickName&&(a.my=!0,o.myRankData=a)}o.rankList=o.sortRank(i),o.battleInit=!0;var n={type:"battleUIRank",score:0};o.setViewVisiable(n.type),o.drawRankList(o.rankList,n)},fail:function(e){reject(e)}})}})},setViewVisiable:function(e){this.finishGameRank.active=!1,this.rankGmameView.active=!1,this.aboveGameView.active=!1,"battleUIRank"==e?this.aboveGameView.active=!0:"rankUIGroupRank"==e?this.rankGmameView.active=!0:"rankUIFriendRank"==e?this.rankGmameView.active=!0:"gameOverUIRank"==e&&(this.finishGameRank.active=!0)},drawRankOverList:function(s,c){var r=this;wx.getUserInfo({openIdList:["selfOpenId"],lang:"zh_CN",success:function(e){console.log("getUserInfo success",e.data);for(var t=null,a=[],n=!1,i=0;i<s.length;i++){var o=s[i];if(o.rank=i+1,o.my=!1,o.nickname!=e.data[0].nickName){if(1==n&&a.length<=2&&a.push(o),3<=a.length)break;t=o}else o.my=!0,null!=t&&a.push(t),a.push(o),n=!0}r.drawRankList(a,c)},fail:function(e){reject(e)}})},drawRankFrientList:function(n,i){var o=this;wx.getUserInfo({openIdList:["selfOpenId"],lang:"zh_CN",success:function(e){console.log("getUserInfo success",e.data);for(var t=0;t<n.length;t++){var a=n[t];a.rank=t+1,a.my=!1,a.nickname==e.data[0].nickName&&(a.my=!0)}o.drawRankList(n,i)},fail:function(e){reject(e)}})},drawRankList:function(e,t){console.log("drawRankList",e,t),"gameOverUIRank"==t.type?this.finishGameRank.getComponent("FinishGameRank").loadRank(e):"rankUIFriendRank"==t.type||"rankUIGroupRank"==t.type?this.rankGmameView.getComponent("RankGameView").loadRank(e):"battleUIRank"==t.type&&1==this.battleInit&&this.aboveGameView.getComponent("AboveGameView").loadRank(e,this.myRankData,t.score)},sortRank:function(e){return e.sort(this.sortFunction)},sortFunction:function(e,t){for(var a=0,n=0,i=0;i<e.KVDataList.length;i++){var o=e.KVDataList[i];"maxScore"==o.key&&(a=parseInt(o.value))}for(i=0;i<t.KVDataList.length;i++){var s=t.KVDataList[i];"maxScore"==s.key&&(n=parseInt(s.value))}return n-a}}),cc._RF.pop()},{}]},{},["AboveGameView","FinishGameRank","RankGameView","RankItem","ScrollView","WxOpenDataJS"]);