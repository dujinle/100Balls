cc.Class({
    extends: cc.Component,

    properties: {
		radian:30,
		speed:10,
		width:20,
		height:20,
		balls:null,
    },


    onLoad () {
		console.log("creat cup start");
		this.balls = {};
		this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
		this.node.getComponent(cc.RigidBody).gravityScale = 0;
		//杯子翻转标志
		this.rotateFlag = false;
	},
	startMove(width,height,speed,radian){
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.radian = radian;
		this.schedule(this.moveCircle, 0.01);
	},
    moveCircle (dt) {
		//console.log(dt);
		var moveStep = this.speed * dt;
		var pos = this.node.getPosition();
		if(this.lastPos == null){
			//第一次移动确定移动方向之后移动
			var left = Math.abs(pos.x) + moveStep - this.width/2;
			if(left > 0){
				this.node.x = GlobalData.CupMoveDir == 'right'?this.width/2: -this.width/2;
				this.node.y = this.node.y - left;
			}else{
				this.node.x = GlobalData.CupMoveDir == 'right'?this.node.x + moveStep: this.node.x - moveStep;
			}
			this.lastPos = pos;
		}else{
			//连续移动中判断我的移动方向 左右上下
			var isRight = pos.x - this.lastPos.x;
			var isUp = pos.y - this.lastPos.y;
			if(isRight != 0){
				var left = isRight > 0? (Math.abs(pos.x + moveStep) - this.width/2) : (Math.abs(pos.x - moveStep) - this.width/2);
				if(left > 0){
					this.node.x = isRight > 0 ? this.width/2:-this.width/2;
					if(GlobalData.CupMoveDir == 'right'){
						this.node.y = isRight > 0?this.node.y - left:this.node.y + left;
					}else{
						this.node.y = isRight > 0?this.node.y + left:this.node.y - left;
					}
				}else{
					this.node.x = isRight > 0?this.node.x + moveStep: this.node.x - moveStep;
				}
			}
			else if(isUp != 0){
				var left = isUp > 0 ? (Math.abs(pos.y + moveStep) - this.height/2) : Math.abs(pos.y - moveStep) - this.height/2;
				if(left > 0){
					this.node.y = isUp > 0?this.height/2: -this.height/2;
					if(GlobalData.CupMoveDir == 'right'){
						this.node.x = isUp > 0?this.node.x + left:this.node.x - left;
					}else{
						this.node.x = isUp > 0?this.node.x - left:this.node.x + left;
					}
				}else{
					this.node.y = isUp > 0?this.node.y + moveStep: this.node.y - moveStep;
				}
			}
			this.lastPos = pos;
		}
		//如果杯子运动到底部则关闭瓶盖
		if(this.node.y == -this.height/2){
			var physicsChainColliders = this.node.getComponents(cc.PhysicsChainCollider);
			for(var i = 0;i < physicsChainColliders.length;i++){
				if(physicsChainColliders[i].tag == GlobalData.RigidBodyTag.cupLine){
					physicsChainColliders[i].enabled = true;
					break;
				}
			}
		}
		if(this.rotateFlag != null && this.rotateFlag.isDone == false){
			return;
		}
		//如果有球体进入杯子则进行翻转动作
		if(this.getBallsLength() > 0){
			//打开瓶盖
			var physicsChainColliders = this.node.getComponents(cc.PhysicsChainCollider);
			for(var i = 0;i < physicsChainColliders.length;i++){
				if(physicsChainColliders[i].tag == GlobalData.RigidBodyTag.cupLine){
					physicsChainColliders[i].enabled = false;
					break;
				}
			}
			if(GlobalData.CupMoveDir == 'right'){
				var size = this.node.getContentSize();
				if(this.node.y == this.height/2 && (this.node.x < 0)&& (this.node.x >= -this.speed)){
					this.rotateFlag = this.node.runAction(cc.rotateBy(2, 360));
					this.clearBalls();
				}
			}else{
				var size = this.node.getContentSize();
				if(this.node.y == this.height/2 && (this.node.x > 0 && this.node.x <= this.speed)){
					this.rotateFlag = this.node.runAction(cc.rotateBy(2, -360));
					this.clearBalls();
				}
			}
		}
	},
	getBallsLength(){
		var length = 0;
		for(let key in this.balls){
			length += 1;
		}
		return length;
	},
	clearBalls(){
		for(let key in this.balls){
			let otherCollider = this.balls[key];
			//otherCollider.node.getComponent(cc.RigidBody).gravityScale = 2;
		}
		this.balls = {};
	},
	getXY(width,height,radian){
		let angle = radian %360 / 180 * Math.PI;
		let x = height / 2 * Math.tan(angle);
		let y = height / 2 / Math.tan(angle);
		//console.log(width,height,x,y);
		if(Math.abs(x) > width/2){
			x = width/2;
		}
		if(Math.abs(y) > height/2){
			y = height/2
		}
		if(angle <= Math.PI){
			x = Math.abs(x);
		}else{
			x = Math.abs(x) * -1;
		}
		if(angle <= Math.PI/2 || angle >= Math.PI * 3/2){
			y = Math.abs(y);
		}else{
			y = Math.abs(y) * -1;
		}
		//console.log(width,height,x,y);
		return cc.p(x,y);
	},
	// 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
		//console.log('onBeginContact');
		//如果 碰撞的 杯口的挡板则球体进入杯子 并取消碰撞效果
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cupLine){
			this.balls[otherCollider.node.uuid] = otherCollider;
			contact.disabled = true;
		}
		//console.log('onBeginContact');
    },

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
    },

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve: function (contact, selfCollider, otherCollider) {
		//如果 碰撞的 杯口的挡板则球体进入杯子 并取消碰撞效果
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball && selfCollider.tag == GlobalData.RigidBodyTag.cupLine){
			this.balls[otherCollider.node.uuid] = otherCollider;
			contact.disabled = true;
		}
    },

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve: function (contact, selfCollider, otherCollider) {
		//球体拖入杯子中之后设置球体重量为0 防止压坏杯子
		if(otherCollider.tag == GlobalData.RigidBodyTag.ball){
			if(this.balls[otherCollider.node.uuid] != null){
				//otherCollider.node.getComponent(cc.RigidBody).gravityScale = 0;
				//contact.disabled = true;
			}
		}
    },
	update(dt){
		//球体 与 杯子开始接触 避免发生碰撞效果 
		/*
		if(this.touchFlag == 1){
			console.log('球体与杯子发生碰撞时......');
			this.node.getComponent(cc.RigidBody).type = cc.RigidBodyType.Static;
			this.touchFlag = 0;
		}
		*/
	}
});
