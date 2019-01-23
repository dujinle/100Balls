var CupUtil = {
	//计算value的rate的近似跟
	Sqrt:function(start,rate,end){
		var step = 0;
		while(start > end){
			start /= rate;
			step += 1;
		}
		if(step == 0){
			return 1;
		}
		return step;
	},
	moveRightV2:function(node,dt){
		var nodeCom = node.getComponent('RigidCup');
		if(node.x >= nodeCom.width/2 && nodeCom.moveDir == 1){
			node.setPosition(cc.v2(nodeCom.width/2,nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,-nodeCom.addSpeed);
			nodeCom.moveDir = 2;
		}
		if(nodeCom.moveDir == 2 && node.y <= -nodeCom.height/2){
			node.setPosition(cc.v2(nodeCom.width/2,-nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.v2(-nodeCom.addSpeed,0);
			nodeCom.moveDir = 3;
		}
		if(nodeCom.moveDir == 3 && node.x <= -nodeCom.width/2){
			node.setPosition(cc.v2(-nodeCom.width/2,-nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,nodeCom.addSpeed);
			nodeCom.moveDir = 4;
		}
		if(nodeCom.moveDir == 4 && node.y >= nodeCom.height/2){
			node.setPosition(cc.v2(-nodeCom.width/2,nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.v2(nodeCom.addSpeed,0);
			nodeCom.moveDir = 1;
		}
	},
	moveLeftV2(node,dt){
		var nodeCom = node.getComponent('RigidCup');
		if(node.x <= -nodeCom.width/2 && nodeCom.moveDir == 1){
			node.setPosition(cc.v2(-nodeCom.width/2,nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,-nodeCom.addSpeed);
			nodeCom.moveDir = 2;
		}
		if(nodeCom.moveDir == 2 && node.y <= -nodeCom.height/2){
			node.setPosition(cc.v2(-nodeCom.width/2,-nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.v2(nodeCom.addSpeed,0);
			nodeCom.moveDir = 3;
		}
		if(nodeCom.moveDir == 3 && node.x >= nodeCom.width/2){
			node.setPosition(cc.v2(nodeCom.width/2,-nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0,nodeCom.addSpeed);
			nodeCom.moveDir = 4;
		}
		if(nodeCom.moveDir == 4 && node.y >= nodeCom.height/2){
			node.setPosition(cc.v2(nodeCom.width/2,nodeCom.height/2));
			node.getComponent(cc.RigidBody).linearVelocity = cc.v2(-nodeCom.addSpeed,0);
			nodeCom.moveDir = 1;
		}
	},
	moveRight(node,dt){
		node.getComponent(cc.RigidBody).syncPosition();
		var nodeCom = node.getComponent('RigidCup');
		var moveDist = nodeCom.addSpeed * dt;
		if(nodeCom.moveDir == 1){
			var left = node.x + moveDist - nodeCom.width/2;
			if(left > 0){
				node.x = nodeCom.width/2;
				node.y -= left;
				nodeCom.moveDir = 2;
			}else{
				node.x += moveDist;
			}
		}
		if(nodeCom.moveDir == 2){
			var left = Math.abs(node.y - moveDist) - nodeCom.height/2;
			if(left > 0){
				node.y = -nodeCom.height/2;
				node.x -= left;
				nodeCom.moveDir = 3;
			}else{
				node.y -= moveDist;
			}
		}
		if(nodeCom.moveDir == 3){
			var left = Math.abs(node.x - moveDist) - nodeCom.width/2;
			if(left > 0){
				node.x = -nodeCom.width/2;
				node.y += left;
				nodeCom.moveDir = 4;
			}else{
				node.x -= moveDist;
			}
		}
		if(nodeCom.moveDir == 4){
			var left = Math.abs(node.y + moveDist) - nodeCom.height/2;
			if(left > 0){
				node.y = nodeCom.height/2;
				node.x += left;
				nodeCom.moveDir = 1;
			}else{
				node.y += moveDist;
			}
		}
		
	},
	moveLeft(node,dt){
		node.getComponent(cc.RigidBody).syncPosition();
		var nodeCom = node.getComponent('RigidCup');
		var moveDist = nodeCom.addSpeed * dt;
		if(nodeCom.moveDir == 1){
			var left = Math.abs(node.x - moveDist) - nodeCom.width/2;
			if(left > 0){
				node.x = -nodeCom.width/2;
				node.y -= left;
				nodeCom.moveDir = 2;
			}else{
				node.x -= moveDist;
			}
		}
		if(nodeCom.moveDir == 2){
			var left = Math.abs(node.y - moveDist) - nodeCom.height/2;
			if(left > 0){
				node.y = -nodeCom.height/2;
				node.x += left;
				nodeCom.moveDir = 3;
			}else{
				node.y -= moveDist;
			}
		}
		if(nodeCom.moveDir == 3){
			var left = Math.abs(node.x + moveDist) - nodeCom.width/2;
			if(left > 0){
				node.x = nodeCom.width/2;
				node.y += left;
				nodeCom.moveDir = 4;
			}else{
				node.x += moveDist;
			}
		}
		if(nodeCom.moveDir == 4){
			var left = Math.abs(node.y + moveDist) - nodeCom.height/2;
			if(left > 0){
				node.y = nodeCom.height/2;
				node.x -= left;
				nodeCom.moveDir = 1;
			}else{
				node.y += moveDist;
			}
		}
		
	},
	
};
module.exports = CupUtil;
