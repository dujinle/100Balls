cc.Class({
    extends: cc.Component,

    properties: {
		level:0,
		color:null,
		isInCup:false,
		isAbled:true,
		touchCupMusic:false,
		touchFloorMusic:false,
    },
    onLoad () {
		console.log("creat ball start");
		this.fallFlag = false;
		this.setColor(this.level);
	},
	fallReset(){
		this.fallFlag = false;
		this.touchCupMusic = false;
		this.touchFloorMusic = false;
		this.isAbled = true;
	},
	setColor(level){
		this.level = level;
		this.color = GlobalData.BallConfig.BallColor[level];
		var colorMat = GlobalData.BallConfig.BallColorDic[this.color];
		this.node.color = new cc.Color(colorMat[0],colorMat[1],colorMat[2]);
	}
});
