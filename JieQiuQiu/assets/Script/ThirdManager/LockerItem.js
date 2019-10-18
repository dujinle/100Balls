cc.Class({
    extends: cc.Component,

    properties: {
		appName:null,
		appId:null,
		linkPages:null,
		gameLogo:cc.Node,
		logoUrl:null,
		hotSprite:cc.Node,
    },
	setLinkGame(item){
		var self = this;
		this.appName = item.name;
		this.appId = item.appid;
		this.logoUrl = item.logo;
		this.hotSprite.active = false;
        //是否抖动
        let playShake = item.playShake;
        //是否游戏有序列帧路径
        let linkSpriteFrames = item.linkSpriteFrames;
        // 序列帧速度
        let spriteFrameSpeed = !item.spriteFrameSpeed ? 1 : item.spriteFrameSpeed;
		if (!linkSpriteFrames) {
			cc.loader.load(this.logoUrl, function (err, texture) {
				// Use texture to create sprite frame
				//console.log('setLinkGame',texture);
				var sprite = self.gameLogo.getComponent(cc.Sprite);
				sprite.spriteFrame = new cc.SpriteFrame(texture);
				if (playShake) {
                    self.playShakeAction();
                }
				if(item.hotFlag != 0){
					console.log('setLinkGame',item.name);
					self.hotSprite.active = true;
				}
			});
        } else {
            let frames = [];
            for (let i = 0; i < linkSpriteFrames.length; i++) {
                let remoteUrl = linkSpriteFrames[i];
                cc.loader.load(remoteUrl, function (err, texture) {
                    var sprite = new cc.SpriteFrame(texture);
                    frames.push(sprite);
                    if (linkSpriteFrames.length == frames.length) {
                        self.playSpriteFrames(frames, frames.length, spriteFrameSpeed);
                    }
                });
            }
        }
	},
    //播放序列帧动画
    playSpriteFrames: function (frames, sample, speed) {
        this.node.addComponent(cc.Animation);
        var ani = this.node.getComponent(cc.Animation);
        let clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
        clip.name = "ani";
        clip.wrapMode = cc.WrapMode.Loop; // 播放模式
        clip.speed = speed; // 播放速度控制
        ani.addClip(clip);
        ani.play("ani");
    },
	pressCb(event){
		try{
			wx.navigateToMiniProgram({
				appId: this.appId,
				path: this.linkPages,
				extarData: {
					open: 'happy'
				},
				envVersion: 'develop', //release
				success(res) {
					console.log(res);
				},
				fail(res){
					console.log(res);
				}
			})
		}catch(err){
			console.log(err);
		}
	}
});
