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
			successCallback:this.shareSuccessCb.bind(this),
			failCallback:this.shareFailedCb.bind(this),
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
	},
	groupRankButtonCb(){
		if(this.audioManager != null){
			this.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		}
		EventManager.emit({type:'RankGroupView'});
	},
	shareSuccessCb(type, shareTicket, arg){
		console.log(type, shareTicket, arg);
	},
	shareFailedCb(type,arg){
		console.log(type,arg);
	},
});
