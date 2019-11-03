var CupFactory = require('CupFactory');
cc.Class({
    extends: cc.Component,

    properties: {
		gotoHomeButton:cc.Node,
		returnGame:cc.Node,
		innerChain:cc.Node,
    },

    onLoad () {
		this.node.on(cc.Node.EventType.TOUCH_START,function(e){
			e.stopPropagation();
		});
	},
	//继续游戏按钮回调
	onContinueCb(event){
		GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		this.hidePause(()=>{
			GlobalData.game.audioManager.getComponent('AudioManager').resumeGameBg();
			CupFactory.continueTrack();
		});
	},
	//重新开始按钮回调
	onResetCb(event){
		GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		this.hidePause(()=>{
			GlobalData.game.audioManager.getComponent('AudioManager').stopGameBg();
			GlobalData.game.mainGame.getComponent('MainGame').destroyGame();
			GlobalData.game.startGame.getComponent('StartGame').onShow();
		});
	},
	showPause(){
		console.log("showPause game board show");
		this.node.active = true;
		this.gotoHomeButton.scale = 0;
		this.returnGame.scale = 0;
		var returnGameScale = cc.scaleTo(GlobalData.TimeActionParam.PauseGameMoveTime,1);
		this.returnGame.runAction(returnGameScale);
		var gotoHomeScale = cc.scaleTo(GlobalData.TimeActionParam.PauseGameMoveTime,1);
		this.gotoHomeButton.runAction(gotoHomeScale);
		//this.initInnerChain(0);
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
	hidePause(callBack = null){
		var self = this;
		console.log("start game board hide");
		var returnGameAction = cc.scaleTo(GlobalData.TimeActionParam.PauseGameMoveTime,0.2);
		this.returnGame.runAction(returnGameAction);
		var gotoHomeAction = cc.scaleTo(GlobalData.TimeActionParam.PauseGameMoveTime,0.2);
		this.gotoHomeButton.runAction(gotoHomeAction);
		var hideAction = cc.callFunc(function(){
			self.node.active = false;
			if(callBack != null){
				callBack();
			}
		},this);
		
		this.node.runAction(cc.sequence(
			cc.delayTime(GlobalData.TimeActionParam.PauseGameMoveTime),
			hideAction
		));
	}
    // update (dt) {},
});