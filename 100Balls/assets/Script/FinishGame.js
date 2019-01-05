var ThirdAPI = require('ThirdAPI');
cc.Class({
    extends: cc.Component,

    properties: {
		rankSprite:cc.Node,
		isDraw:false,
    },
    onLoad () {
		console.log("finish game board load");
		cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            // 设置是否吞没事件，在 onTouchBegan 方法返回 true 时吞没
            onTouchBegan: function (touch, event) {
                return true;
            },
            onTouchMoved: function (touch, event) {            // 触摸移动时触发
            },
            onTouchEnded: function (touch, event) {            // 点击事件结束处理
			}
         }, this.node);
		 this.EventCustom = new cc.Event.EventCustom("BallFallEvent", true);
	},
	start(){
		this.texture = new cc.Texture2D();
		var openDataContext = wx.getOpenDataContext();
		this.sharedCanvas = openDataContext.canvas;
	},
	show(){
		console.log("finish game show");
		this.isDraw = true;
		//this.node.active = true;
		var param = {
			type:'gameOverUIRank'
		};
		ThirdAPI.getRank(param);
	},
	hide(){
		this.isDraw = false;
		this.node.active = false;
	},
	rankButtonCb(){
		this.EventCustom.setUserData({type:'RankView'});
		this.node.dispatchEvent(this.EventCustom);
	},
	restartButtonCb(){
		this.EventCustom.setUserData({type:'ReStartGame'});
		this.node.dispatchEvent(this.EventCustom);
	},
	shareToFriends(){
		var param = {
			type:null,
			arg:null,
			successCallback:this.shareSuccessCb,
			failCallback:this.shareFailedCb,
			shareName:'分享你的战绩',
			isWait:false
		};
		ThirdAPI.shareGame(param);
	},
	shareSuccessCb(type, shareTicket, arg){
		console.log(type, shareTicket, arg);
	},
	shareFailedCb(type,arg){
		console.log(type,arg);
	},
	rankSuccessCb(){
		if(!this.texture){
			return;
		}
		this.texture.initWithElement(this.sharedCanvas);
		this.texture.handleLoadedTexture();
		this.rankSprite.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.texture);
	},
	update(){
		//console.log("update finish game");
		if(this.isDraw == true){
			this.rankSuccessCb();
		}
	}
});
