var WxVideoAd = require('WxVideoAd');
var ThirdAPI = require('ThirdAPI');
var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		propKey:null,
		openType:null,
		cancelNode:cc.Node,
		bgContext:cc.Node,
		typeSprite:cc.Node,
    },
    onLoad () {
		 this.cancelNode.active = false;
		 this.bgContext.scale = 0.2;
		 this.iscallBack = false;
	},
	initLoad(openType,prop){
		var self = this;
		this.openType = openType;
		this.propKey = prop;
		if(this.openType == 'PropShare'){
			this.typeSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['share'];
		}else if(this.openType == 'PropAV'){
			this.typeSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['video'];
		}
		this.bgContext.runAction(cc.scaleTo(GlobalData.TimeActionParam.PropSBAScaleTime,1));
		setTimeout(function(){
			self.cancelNode.active = true;
		},1000);
	},
	buttonCb(){
		this.iscallBack = false;
		if(this.openType == "PropShare"){
			var param = {
				type:null,
				arg:null,
				successCallback:this.shareSuccessCb.bind(this),
				failCallback:this.shareFailedCb.bind(this),
				shareName:this.openType,
				isWait:true
			};
			if(GlobalData.cdnGameConfig.shareCustomSet == 0){
				param.isWait = false;
			}
			ThirdAPI.shareGame(param);
		}else if(this.openType == "PropAV"){
			console.log(this.openType);
			this.AVSuccessCb = function(arg){
				EventManager.emit({
					type:'PropRelive'
				});
				this.node.dispatchEvent(this.EventCustom);
			}.bind(this);
			this.AVFailedCb = function(arg){
				if(arg == 'cancle'){
					this.showFailInfo();
				}else if(arg == 'error'){
					this.openType = "PropShare";
					this.buttonCb();
				}
			}.bind(this);
			WxVideoAd.initCreateReward(this.AVSuccessCb,this.AVFailedCb,this);
		}
	},
	shareSuccessCb(type, shareTicket, arg){
		if(this.iscallBack == false){
			console.log(type, shareTicket, arg);
			EventManager.emit({
				type:'PropRelive'
			});
		}
		this.iscallBack = true;
	},
	shareFailedCb(type,arg){
		if(this.iscallBack == false && this.node.active == true){
			this.showFailInfo();
			console.log(type,arg);
		}
		this.iscallBack = true;
	},
	showFailInfo(){
		try{
			var self = this;
			var content = '请分享到不同的群获得更多的好友帮助!';
			if(this.openType == 'PropAV'){
				content = '看完视频才能获得奖励，请再看一次!';
			}
			wx.showModal({
				title:'提示',
				content:content,
				cancelText:'取消',
				confirmText:'确定',
				confirmColor:'#53679c',
				success(res){
					if (res.confirm) {
						self.buttonCb();
					}else if(res.cancel){}
				}
			});
		}catch(err){}
	},
	cancel(){
		EventManager.emit({
			type:'PropCancle'
		});
		this.node.removeFromParent();
		this.node.destroy();
	}
});
