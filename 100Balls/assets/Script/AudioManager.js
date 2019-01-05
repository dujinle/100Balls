cc.Class({
    extends: cc.Component,

  properties: {
		audioSources:{
			type:cc.AudioSource,
			default:[]
		},
    },
	play(type){
		if(GlobalData.GameInfoConfig.audioSupport == 1){
			this.audioSources[type].getComponent(cc.AudioSource).play();
		}
	}
});
