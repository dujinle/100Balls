var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		gotoHomeButton:cc.Node,
		returnGame:cc.Node,
    },

    onLoad () {
	},
	//继续游戏按钮回调
	onContinueCb(event){
		EventManager.emit({type:'PauseContinue'});
	},
	//重新开始按钮回调
	onResetCb(event){
		EventManager.emit({type:'PauseReset'});
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
	},
	hidePause(callBack = null){
		var self = this;
		console.log("start game board hide");
		var returnGameAction = cc.scaleTo(GlobalData.TimeActionParam.PauseGameMoveTime,0.2);
		this.returnGame.runAction(returnGameAction);
		var gotoHomeAction = cc.scaleTo(GlobalData.TimeActionParam.PauseGameMoveTime,0.2);
		this.gotoHomeButton.runAction(gotoHomeAction);
		var hideAction = cc.callFunc(function(){
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