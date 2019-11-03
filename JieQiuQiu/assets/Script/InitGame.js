var ThirdAPI = require('ThirdAPI');
var BoxFactory = require('BoxFactory');
var util = require('util');
cc.Class({
    extends: cc.Component,

    properties: {
		startGame:cc.Node,
		mainGame:cc.Node,
		finishGame:cc.Node,
		rankGame:cc.Node,
		pauseGame:cc.Node,
		propGame:cc.Node,
		audioManager:cc.Node,
    },
	onLoad: function () {
		ThirdAPI.loadLocalData();
		this.loadDataSync();
		GlobalData.game = this;
		//ThirdAPI.loadCDNData();
		this.startGame.getComponent('StartGame').onShow();
		this.startGame.getComponent('StartGame').startBtn.getComponent(cc.Button).interactable = false;
		this.mainGame.active = false;
		this.finishGame.active = false;
		this.rankGame.active = false;
		this.pauseGame.active = false;
		this.propGame.active = false;
		util.customScreenAdapt();
		//打开物理引擎
		//如果用了物理引擎，可以通过修改游戏帧率和检测的步长降低检测频率，提高性能。
		this.pymanager = cc.director.getPhysicsManager();
		this.pymanager.start();
		this.pymanager.enabledAccumulator = true;	// 开启物理步长的设置
		this.pymanager.FIXED_TIME_STEP = 1/30;		// 物理步长，默认 FIXED_TIME_STEP 是 1/60
		this.pymanager.VELOCITY_ITERATIONS = 8;		// 每次更新物理系统处理速度的迭代次数，默认为 10
		this.pymanager.POSITION_ITERATIONS = 8;		// 每次更新物理系统处理位置的迭代次数，默认为 10
		BoxFactory.onInit(this.pymanager._world,cc.PhysicsManager.PTM_RATIO,cc.winSize);
		/*
		this.pymanager.debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
		cc.PhysicsManager.DrawBits.e_pairBit |
		cc.PhysicsManager.DrawBits.e_centerOfMassBit |
		cc.PhysicsManager.DrawBits.e_jointBit |
		cc.PhysicsManager.DrawBits.e_shapeBit;
		*/
    },
	loadDataSync(){
		var self = this;
		//异步加载动态数据
		this.rate = 0;
		this.resLength = 10;
		GlobalData.assets = {};
		this.loadUpdate = function(){
			console.log("this.rate:" + self.rate);
			var scale = Math.floor((self.rate/self.resLength ) * 100);
			if(self.rate >= self.resLength){
				self.unschedule(self.loadUpdate);
				self.startGame.getComponent('StartGame').startBtn.getComponent(cc.Button).interactable = true;
			}
		};
		cc.loader.loadRes("dynamicPlist", cc.SpriteAtlas, function (err, atlas) {
			for(var key in atlas._spriteFrames){
				console.log("load res :" + key);
				GlobalData.assets[key] = atlas._spriteFrames[key];
			}
			//self.rate = self.rate + 1;
		});
		cc.loader.loadResDir("dynImages", cc.SpriteFrame, function (err, assets) {
			for(var i = 0;i < assets.length;i++){
				console.log("load res :" + assets[i].name);
				GlobalData.assets[assets[i].name] = assets[i];
				self.rate = self.rate + 1;
			}
		});
		cc.loader.loadResDir("prefabs",function (err, assets) {
			for(var i = 0;i < assets.length;i++){
				GlobalData.assets[assets[i].name] = assets[i];
				self.rate = self.rate + 1;
				console.log("load res prefab:" + assets[i].name);
			}
		});
		this.schedule(this.loadUpdate,0.5);
	}
});
