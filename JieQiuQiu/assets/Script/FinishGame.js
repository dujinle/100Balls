var ThirdAPI = require('ThirdAPI');
cc.Class({
    extends: cc.Component,

    properties: {
		rankSprite:cc.Node,
		isDraw:false,
		innerChain:cc.Node,
    },
    onLoad () {
		this.node.on(cc.Node.EventType.TOUCH_START,function(e){
			e.stopPropagation();
		});
		console.log("finish game board load");
	},
	start(){
		try{
			this.texture = new cc.Texture2D();
			var openDataContext = wx.getOpenDataContext();
			this.sharedCanvas = openDataContext.canvas;
		}catch(error){}
	},
	show(){
		console.log("finish game show");
		this.node.active = true;
		//this.initInnerChain(0);
		if(typeof wx != 'undefined'){
			this.isDraw = true;
			//this.node.active = true;
			var param = {
				type:'gameOverUIRank'
			};
			ThirdAPI.getRank(param);
		}
	},
	initInnerChain(time){
		var self = this;
		this.innerChain.active = false;
		if(GlobalData.cdnPropParam.PropUnLock['PropLocker'] <= GlobalData.GameInfoConfig.juNum){
			this.innerChain.getComponent('ScrollLinkGame').createAllLinkGame(GlobalData.cdnOtherGameDoor.locker);
			this.node.runAction(cc.sequence(cc.delayTime(time),cc.callFunc(function(){
				self.innerChain.active = true;
			})));
		}
	},
	rankButtonCb(){
		this.isDraw = false;
		GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		GlobalData.game.rankGame.getComponent('RankGame').show();
	},
	restartButtonCb(){
		GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		this.isDraw = false;
		this.node.active = false;
		GlobalData.game.mainGame.getComponent('MainGame').destroyGame();
		GlobalData.game.mainGame.getComponent('MainGame').initGame();
	},
	shareToFriends(){
		var param = {
			type:null,
			arg:null,
			successCallback:this.shareSuccessCb.bind(this),
			failCallback:this.shareFailedCb.bind(this),
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
