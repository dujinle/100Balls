var ThirdAPI = require('ThirdAPI');
cc.Class({
    extends: cc.Component,

    properties: {
		soundOnNode:cc.Node,
		soundOffNode:cc.Node,
		scoreLabel:cc.Node,
		Level:cc.Node,
		startBtn:cc.Node,
    },
    onLoad () {
		this.node.on(cc.Node.EventType.TOUCH_START,function(e){
			e.stopPropagation();
		});
	},
	onShow(){
		this.node.active = true;
		if(GlobalData.GameInfoConfig.audioSupport == 1){
			this.soundOnNode.active = true;
			this.soundOffNode.active = false;
		}else{
			this.soundOnNode.active = false;
			this.soundOffNode.active = true;
		}
		this.scoreLabel.getComponent(cc.Label).string = GlobalData.GameInfoConfig.maxScore;
		this.Level.getComponent(cc.Label).string = GlobalData.GameInfoConfig.maxLevel;
	},
    startButtonCb(event){
		this.node.active = false;
		GlobalData.GameInfoConfig.juNum += 1;
		GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		GlobalData.game.mainGame.active = true;
		GlobalData.game.mainGame.getComponent('MainGame').initGame();
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
		GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
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
		GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.ButtonClick);
		GlobalData.game.rankGame.getComponent('RankGame').show();
	},
	shareSuccessCb(type, shareTicket, arg){
	},
	shareFailedCb(type,arg){
	},
    update (dt) {
		this.scoreLabel.getComponent(cc.Label).string = GlobalData.GameInfoConfig.maxScore;
		this.Level.getComponent(cc.Label).string = GlobalData.GameInfoConfig.maxLevel;
	},
});
