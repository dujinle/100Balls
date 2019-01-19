var ThirdAPI = require('ThirdAPI');
var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		startButton:cc.Node,
		soundOnNode:cc.Node,
		soundOffNode:cc.Node,
		scoreLabel:cc.Node,
		levelLabel:cc.Node,
		audioManager:null,
    },
    onLoad () {
		/*
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
		*/
	},
	start(){
		if(GlobalData.GameInfoConfig.audioSupport == 1){
			this.soundOnNode.active = true;
			this.soundOffNode.active = false;
		}else{
			this.soundOnNode.active = false;
			this.soundOffNode.active = true;
		}
		this.scoreLabel.getComponent(cc.Label).string = GlobalData.GameInfoConfig.maxScore;
		this.levelLabel.getComponent(cc.Label).string = 'Level ' + GlobalData.GameInfoConfig.maxLevel;
	},
	startButtonCb(event){
		if(this.audioManager != null){
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		}
		EventManager.emit({type:'StartGame'});
		/*
		this.EventCustom.setUserData({
			type:'StartGame'
		});
		this.node.dispatchEvent(this.EventCustom);
		*/
	},
	soundButtonCb(){
		if(GlobalData.GameInfoConfig.audioSupport == 0){
			this.soundOnNode.active = true;
			this.soundOffNode.active = false;
			GlobalData.GameInfoConfig.audioSupport = 1;
		}else{
			GlobalData.GameInfoConfig.audioSupport = 0;
			this.soundOnNode.active = false;
			this.soundOffNode.active = true;
		}
	},
    shareButtonCb(){
		if(this.audioManager != null){
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		}
		var param = {
			type:null,
			arg:null,
			successCallback:this.shareSuccessCb,
			failCallback:this.shareFailedCb,
			shareName:'share',
			isWait:false
		};
		ThirdAPI.shareGame(param);
	},
	rankButtonCb(){
		if(this.audioManager != null){
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		}
		EventManager.emit({type:'RankView'});
		/*
		this.EventCustom.setUserData({type:'RankView'});
		this.node.dispatchEvent(this.EventCustom);
		*/
	},
	groupRankButtonCb(){
		if(this.audioManager != null){
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		}
		EventManager.emit({type:'RankGroupView'});
		/*
		this.EventCustom.setUserData({type:'RankGroupView'});
		this.node.dispatchEvent(this.EventCustom);
		*/
	},
	shareSuccessCb(type, shareTicket, arg){
		console.log(type, shareTicket, arg);
	},
	shareFailedCb(type,arg){
		console.log(type,arg);
	},
	
	// update (dt) {},
});
