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
			//微信同时播放音频的数量有限 8
			if(GlobalData.GameRunTime.AudioPlayNum >= GlobalData.AudioManager.AudioEnginMore){
				let audio = GlobalData.AudioManager.AudioPlays.shift();
				if(audio && audio.isPlaying){
					audio.stop();
				}
				GlobalData.GameRunTime.AudioPlayNum -= 1;
			}
			var audio = this.audioSources[type].getComponent(cc.AudioSource);
			audio.play();
			GlobalData.AudioManager.AudioPlays.push(audio);
			GlobalData.GameRunTime.AudioPlayNum += 1;
		}
	}
});
