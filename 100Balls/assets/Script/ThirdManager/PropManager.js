let PropManager = {
	//获取道具
	getProp(prop){
		//道具是否开锁
		if(GlobalData.cdnPropParam.PropUnLock[prop] != -1
			&& GlobalData.cdnPropParam.PropUnLock[prop] > GlobalData.GameInfoConfig.juNum){
			return null;
		}
		//道具是否超过使用上限
		var propBag = this.getPropBag(prop);
		if(GlobalData.GamePropParam.useNum[prop] >= propBag.useNum){
			return null;
		}
		var secondProp = this.getShareOrADKey(prop);
		return secondProp;
	},
	//return -1 不可再生 0 可再生 1 直接使用
	checkPropAbled(prop){
		var propBag = this.getPropBag(prop);
		if(GlobalData.GamePropParam.useNum[prop] > propBag.useNum){
			return -1;
		}
		if(GlobalData.GamePropParam.bagNum[prop] <= 0){
			return 0;
		}
		return 1;
	},
	getPropRelive(){
		//如果没有解锁 不可用
		//GlobalData.GamePropParam.bagNum.PropRelive += 1;
		//return 'PropShare';
		if(GlobalData.cdnPropParam.PropUnLock.PropRelive > GlobalData.GameInfoConfig.juNum){
			console.log('getPropRelive unLock');
			return null;
		}
		//如果有道具了 就不获取了
		if(GlobalData.GamePropParam.bagNum.PropRelive > 0 && GlobalData.GamePropParam.useNum.PropRelive == 0){
			var prop = this.getShareOrADKey('PropRelive');
			console.log("getPropRelive",prop);
			return prop;
		}
		if(GlobalData.GamePropParam.useNum.PropRelive > 0){
			console.log("getPropRelive use limit");
			return null;
		}
		if(GlobalData.GamePropParam.bagNum.PropRelive == 0){
			var random = Math.random();
			console.log("getPropRelive",random);
			if(random <= GlobalData.cdnPropParam.PropReliveRate){
				GlobalData.GamePropParam.bagNum.PropRelive += 1;
				return this.getShareOrADKey('PropRelive');
			}else{
				return null;
			}
		}
	},
	getPropStart(){
		//如果没有解锁 不可用
		//return 'PropShare';
		if(GlobalData.cdnPropParam.PropUnLock.PropRelive > GlobalData.gameRunTimeParam.juNum){
			return null;
		}
		//如果有道具了 就不获取了
		if(GlobalData.GamePropParam.bagNum.PropRelive > 0 && GlobalData.GamePropParam.useNum.PropRelive == 0){
			var prop = this.getShareOrADKey('PropRelive');
			return prop;
		}
		return null;
	},
	getShareOrADKey(prop){
		var shareOrAVS = GlobalData.cdnPropParam.PropShareOrADRate[GlobalData.cdnGameConfig.gameModel];
		var shareOrAV = this.getParamByJuShu(shareOrAVS);
		var propsRate = shareOrAV[prop];
		var netProp = this.getRandomRateKey(propsRate);
		return netProp;
	},
	getRandomRateKey(propsRate){
		var prop = null;
		var random = Math.random();
		var randomTmp = 0;
		for(var key in propsRate){
			//console.log(key,propsRate[key]);
			if(random > randomTmp && random <= propsRate[key] + randomTmp){
				prop = key;
			}
			randomTmp = randomTmp + propsRate[key];
		}
		console.log("PropManager.getProp",random,propsRate,prop);
		return prop;
	},
	getPropBag(prop){
		var res = this.getParamByJuShu(GlobalData.cdnPropParam.PropParam[prop]);
		return res;
	},
	/*根据局数获取对应的参数 包括标记局*/
	getParamByJuShu(data){
		for(var key in data){
			if(GlobalData.GameInfoConfig.juNum <= key){
				return data[key];
			}
		}
		return data['default'];
	}
};
module.exports = PropManager;