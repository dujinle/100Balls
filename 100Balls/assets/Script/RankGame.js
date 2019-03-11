var ThirdAPI = require('ThirdAPI');
cc.Class({
    extends: cc.Component,

    properties: {
		rankSprite:cc.Node,
		isDraw:false,
    },
    onLoad () {
		console.log("finish game board load");
	},
	start(){
		try{
			this.texture = new cc.Texture2D();
			var openDataContext = wx.getOpenDataContext();
			this.sharedCanvas = openDataContext.canvas;
		}catch(error){}
	},
	onClose(){
		this.node.removeFromParent();
		this.node.destroy();
	},
	show(type){
		console.log("finish game show");
		this.isDraw = true;
		this.node.active = true;
		var param = {
			type:'rankUIFriendRank'
		};
		if(type != null){
			param.type = type;
		}
		ThirdAPI.getRank(param);
	},
	hide(){
		this.isDraw = false;
		this.node.active = false;
	},
	friendRankCb(){
		console.log("finish game show");
		this.isDraw = true;
		 var param = {
			type:'rankUIFriendRank'
		};
		ThirdAPI.getRank(param);
	},
	groupRankCb(){
		console.log("finish game show");
		this.isDraw = true;
		 var param = {
			type:'rankUIGroupRank'
		};
		ThirdAPI.getRank(param);
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
