var util = require('util');
let CupFactory = {
    _scene:null,
    _world:null,
    _PTM_RATIO:32,
    _winSize:null,
    _roadSet:null,
	_tsize:null,
    _offset:0,
    _dist:{},
    //初始化一下信息
    onInit(scene,world,ptmRatio,offset){
        this._scene = scene;
        this._world = world;
        this._offset = offset;
        this._PTM_RATIO = ptmRatio;
        this._winSize = cc.winSize;
		this._tsize = this._scene.trickNode.getContentSize();
    },
    //杯子动画开始
    onStart(){
		GlobalData.GameRunTime.CurrentSpeed = GlobalData.CupConfig.CupMoveSpeed;
        let oriPos = this._roadSet[0][0];
        let cup = this.creatCup(oriPos);
        cup.getComponent('RigidCup').onStart(this._roadSet[0]);
    },
	stopTrack(){
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				var cupCom = cupNode.getComponent('RigidCup');
				cupCom.stopMove();
			}
		}
	},
	continueTrack(){
		//this.schedule(this.updateMove,0.01);
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				var cupCom = cupNode.getComponent('RigidCup');
				cupCom.resumeMove();
			}
		}
	},
    //创建杯子 包括刚体和节点材质
    creatCup(pos){
        GlobalData.GameInfoConfig.addCupNum += 1;
        GlobalData.GameRunTime.CupAbledNum += 1;
        let cupNode = cc.instantiate(GlobalData.assets['ChainCup']);
        this._scene.trickNode.addChild(cupNode);
		cupNode.setPosition(pos);
        GlobalData.GameRunTime.CupNodesDic[cupNode.uuid] = cupNode;
        return cupNode;
    },
	removeAllCups(){
		for(var key in GlobalData.GameRunTime.CupNodesDic){
			var cupNode = GlobalData.GameRunTime.CupNodesDic[key];
			if(cupNode != null){
				cupNode.getComponent('RigidCup').removeMySelf();
			}
		}
		GlobalData.GameRunTime.CupNodesDic = {};
	},
	updateCircle(){
		console.log('update circle');
		var trickNodeSize = this._scene.trickNode.getContentSize();
		//动画速度 0.1s/100m
		var time = (trickNodeSize.width/2 + 100)/GlobalData.GameRunTime.CurrentSpeed;
		//随机小球颜色升级
		if(GlobalData.GameRunTime.CircleLevel % GlobalData.BallConfig.BallUpLevel == 0){
			setTimeout(function(){
				let UpLevelIsValid = new Array();
				for(let key in GlobalData.GameRunTime.ContentBallsDic){
					let ball = GlobalData.GameRunTime.ContentBallsDic[key];
					if(ball != null && ball.isValid){
						let ballCom = ball.getComponent('RigidBall');
						if(ballCom.isInCup == false){
							UpLevelIsValid.push(ball);
						}
					}
				}
				let BallNode = util.getRandomObjForArray(UpLevelIsValid);
				if(BallNode != -1){
					var ballCom = BallNode.getComponent('RigidBall');
					if(ballCom.level < (GlobalData.BallConfig.BallColor.length - 1)){
						ballCom.setColor(ballCom.level + 1);
					}
				}
			},time);
		}
		//杯子速度升级
		var upFlag = GlobalData.GameRunTime.CircleLevel % GlobalData.CupConfig.CupUpLevel;
		if(upFlag == 0 || GlobalData.GameRunTime.CircleLevel == 1){
			//设置速度升级
			GlobalData.GameRunTime.CurrentSpeed *= (1 + GlobalData.CupConfig.CupSpeedArate);
			if(GlobalData.GameRunTime.CurrentSpeed >= GlobalData.CupConfig.CupMoveMSpeed){
				GlobalData.GameRunTime.CurrentSpeed = GlobalData.CupConfig.CupMoveMSpeed
			}
			setTimeout(()=>{
				this.upLevelCup(true);
			},time);
		}
		//杯子宝箱
		var sbaFlag = GlobalData.GameRunTime.CircleLevel % GlobalData.cdnGameConfig.PropSBAFlag;
		if(sbaFlag == 0){
			setTimeout(()=>{
				this.addSBACup();
			},time);
		}
	},
	upLevelCup(flag){
		let UpLevelIsValid = new Array();
		for(let key in GlobalData.GameRunTime.CupNodesDic){
			let cup = GlobalData.GameRunTime.CupNodesDic[key];
			if(cup != null && cup.isValid){
				var cupCom = cup.getComponent('RigidCup');
				if(cupCom.UpLevelIsValid()){
					UpLevelIsValid.push(cup);
				}
			}
		}
		let CupNode = util.getRandomObjForArray(UpLevelIsValid);
		if(CupNode != -1){
			let cupCom = CupNode.getComponent('RigidCup');
			if(cupCom.level < (GlobalData.CupConfig.CupColor.length - 1)){
				GlobalData.game.audioManager.getComponent('AudioManager').play(GlobalData.AudioManager.CupLevelBell);
				var cupLevel = cupCom.level;
				var setColorFunc = cc.callFunc(function(){
					cupCom.setColor(cupLevel);
				},this);
				var setColorNextFunc = cc.callFunc(function(){
					cupCom.setColor(cupLevel + 1);
				},this);
				CupNode.runAction(cc.sequence(
					cc.delayTime(0.1),
					setColorNextFunc,
					cc.delayTime(0.1),
					setColorFunc,
					cc.delayTime(0.1),
					setColorNextFunc
				));
				//cupCom.setColor(cupCom.level + 1);
				if(flag == false){
					GlobalData.GamePropParam.useNum['PropUpLevel'] += 1;
				}
			}
		}
	},
	addSBACup(){
		let UpLevelIsValid = new Array();
		for(let key in GlobalData.GameRunTime.CupNodesDic){
			let cup = GlobalData.GameRunTime.CupNodesDic[key];
			if(cup != null && cup.isValid){
				let cupCom = cup.getComponent('RigidCup');
				if(cupCom.UpLevelIsValid()){
					UpLevelIsValid.push(cup);
				}
			}
		}
		let CupNode = util.getRandomObjForArray(UpLevelIsValid);
		if(CupNode != -1){
			var sbaNode = cc.instantiate(GlobalData.assets['PropSBA']);
			CupNode.addChild(sbaNode);
			sbaNode.setPosition(cc.v2(0,0));
			CupNode.getComponent('RigidCup').hasSBA = 1;
		}
	},
};
module.exports = CupFactory;