var ScheduleManager = {
	/***********************************************
	 *统一管理 schedule scheduleOnce unschedule 方法
	 *防止重复调用而造成不稳定的问题
	 ***********************************************/
	 Schedules:{
		 Default:function(){}
	 },
	 MySchedule:function(name,func,time,pthis){
		 var res = this.CheckHasSchedule(name);
		 if(res != null){
			 console.log('it has a func schedule,must unschedule it');
			 this.UnMySchedule(name,pthis);
		 }
		 this.Schedules[name] = func;
		 pthis.schedule(func,time);
	 },
	 UnMySchedule:function(name,pthis){
		 if(this.Schedules[name] != null){
			 pthis.unschedule(this.Schedules[name]);
			 this.Schedules[name] = null;
		 }
	 },
	 MyScheduleOnce:function(name,func,time,pthis){
		 var res = this.CheckHasSchedule(name);
		 if(res != null){
			 console.log('it has a func schedule,must unschedule it');
			 this.UnMySchedule(name,pthis);
		 }
		 this.Schedules[name] = func;
		 pthis.scheduleOnce(func,time);
	 },
	 CheckHasSchedule:function(name){
		 return this.Schedules[name];
	 }
};
module.exports = ScheduleManager;