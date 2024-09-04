//全局常量
//确保开启了无障碍
auto.waitFor();
//开启任务
main();
//主函数
function main() {
    //try{
        var msg = "测试语句，表示执行了一次测试且没有报错"
        log("----------------");
        log("开始管理网易云游戏");
        openApp()
        openPlay()
        log("自动管理脚本已启用")
        seatcheck();
        sendmsgtochat(msg);
    //}catch(err){
    //    sendmsgtochat("存在报错，需要检查脚本");
    //}
}

//开启应用
function openApp() {
    if (!launch("com.netease.android.cloudgame")) {
        myAlert('未安装网易云游戏!');
        return;
    }else{
        log("----------------");
        log('已启动网易云游戏');
        log("----------------");
        return;
    }

}

//开启一起玩或进入一起玩房间
function openPlay(){
    var gamedefault = "高配云电脑";
    while (currentActivity() == "com.netease.android.cloudgame.activity.MainActivity"){
        var 一起玩控件 = text("一起玩").id("title").findOne(50);
        一起玩控件.parent().parent().click();
        log("----------------");
        log('在主页面，即将检测是否已开启房间');
        var 正在一起玩 = text("正在一起玩").id("live_detail").findOne(50);
        if(正在一起玩.parent().child(3).clickable()){
            正在一起玩.parent().child(3).click()
            log("已进入开启的房间");
            log("----------------");
        }else{
        var 开房间控件 = className("android.widget.ImageView").id("live_create_btn").findOne(50);
        开房间控件.click()
        sleep(500)
        log("已打开开房间界面");
        sleep(500)
        gamechoose(gamedefault)
        log("已开启房间");
        log("----------------");
        }
        return
    }
    while (currentActivity() == "com.netease.android.cloudgame.plugin.game.dialog.SelectGameDialog"){
        log("正在开房间界面");
        gamechoose(gamedefault);
        log("已开启房间");
        log("----------------");
        return
    }
    while(currentActivity() == "com.netease.android.cloudgame.plugin.livegame.activity.LiveRoomActivity"){
        log("已在房间中");
        log("----------------");
        return
    }
}

//游戏列表索引（换游引擎前置）
//
function gamechoose(gamename){
    sleep(500)
    var 搜索控件 = id("select_game_search_btn").className("android.widget.ImageView").findOne(50);
    搜索控件.click();
    sleep(500)
    var 搜索框 = id("search_game_edt").className("android.widget.EditText").findOne(50);
    搜索框.setText(gamename);
    sleep(500)
    shell("input keyevent 66",true);
    var 搜索结果列表控件 = className("androidx.recyclerview.widget.RecyclerView").id("search_game_result_rv").findOnce(0);
    搜索结果列表控件.children().forEach(function(child){
        sleep(500)
        //找出可点击
        var 可点击项目 = child.child(0).child(0).child(0).findOne(clickable(true));
        //如果这控件没有找到就不继续了
        if(可点击项目 == null ){
            log("未找到项目，可能网易不支持此游戏")
            log("----------------");
            return;
        }else{
            可点击项目.click()
            log("----------------");
            log("已找到以下游戏")
            可点击项目.parent().parent().parent().child(1).text()
        }
    });
    sleep(500)
    var 下一步 = id("select_game_btn").className("android.widget.Button").findOne(50);
    下一步.click();
    sleep(500)
    var 开启一起玩 = id("room_modify_container").className("android.widget.LinearLayout").findOne(50);
    开启一起玩.click();
    sleep(500)
}

//循环管理
function seatcheck(){
    var userinfo = ["admin","none","none","none","none","none",]
    var olduserinfo = ["admin","none","none","none","none","none",]
    while(1){
    sleep(2000)
        for (var i=1;i<6;i++){
            try{className("android.widget.Button").id("dialog_cancel").text("稍后").findOne(50).click()
                log("跳过遮挡界面")
                }catch(err){
                    log("一切正常")
            }
            var 麦位状态 = id("live_user_grid_container").className("android.widget.HorizontalScrollView").findOne(50).child(0).child(i)
            sleep(100)
            userinfo[i] = usercheck(i,麦位状态)
            checkuserinfo(userinfo[i],olduserinfo[i])
            //deluserinfo(userinfo[i],olduserinfo[i])
            olduserinfo[i] = userinfo[i]
            }
        }
        log("----------------");
}

//检查麦位
function usercheck(id,user){
    //麦位状态，玩家名，控制权状态，申请状态,时间刻
    var time = new Date().getTime();
    time = parseInt(time/1000)
    var userinfo = [id,"none",false,false,time,user]
    try{
        if (user.childCount() == 2){
            if(user.child(1).text().includes("号麦")){
                sleep(300)
                userinfo[1] = "麦位无人"
                userinfo[2] = false
                userinfo[3] = false
            }else{
                sleep(300)
                userinfo[1] = user.child(1).text()
                userinfo[2] = false
                userinfo[3] = false
            }
        }else{
            sleep(300)
            if(user.child(1).text() == "1P-主控" ||user.child(1).text() == "正在玩"){
                sleep(300)
                userinfo[1] = user.child(2).text()
                userinfo[2] = true
                userinfo[3] = false
            }else{
                sleep(300)
                userinfo[1] = user.child(2).text()
                userinfo[2] = false
                userinfo[3] = true
            }
        }
        log(userinfo)
        return userinfo
    }catch(err){
        userinfo[1] = "麦位无人"
        userinfo[2] = false
        userinfo[3] = false
        return userinfo
    }
}

//对比用户状态和操作执行
function checkuserinfo(userinfo,olduserinfo){
    var keeptime = 0
    var controltime = 0
    var applytime = 0 
    var userkeeptime = storages.create("Userkeeptime")
    var usercontroltime = storages.create("Usercontroltime")
    var userapplytime = storages.create("Userapplytime")
    var waitlist = new Array()
    if(olduserinfo[1] == userinfo[1] && olduserinfo[1] != '麦位无人'){
        log("该用户已经在麦上存在一个周期")
        keeptime = userinfo[4]- olduserinfo[4]
        if (userkeeptime.get(userinfo[1])!= NaN){
            keeptime = keeptime + userkeeptime.get(userinfo[1])
        }
        userkeeptime.put(userinfo[1], keeptime)
        if(olduserinfo[2] == true){
            log("该用户在上周期持有权限")
            controltime = userinfo[4]- olduserinfo[4]
            if (usercontroltime.get(userinfo[1])!= NaN){
                controltime = controltime + usercontroltime.get(userinfo[1])
            }
            usercontroltime.put(userinfo[1],controltime)
            log("控制时长:"+ controltime)
            if (controltime % 100 <=10){
                //if (controltime >= 30 && controltime <40){
                    sendmsgtochat("@"+ userinfo[1] + " 已经游玩"+ controltime +"秒,请注意本房间没人限时为900秒")
                }
            if (controltime >= 720 && controltime <725){
            //if (controltime >= 30 && controltime <40){
                sendmsgtochat("@"+ userinfo[1] + " 已经游玩"+ controltime +"秒,请在3分钟之内归还控制权，否则将遭遇强制下机")
            }
            if (controltime >= 900){
            //if (controltime >= 30){
                getadmin(userinfo[5])
                usercontroltime.remove(userinfo[1])
            }
        }
        if(olduserinfo[3] == true){
            log("该用户在上周期申请权限")
            if(waitlist.indexOf(userinfo[1]) == -1 ){
                waitlist.push(userinfo[1])
            }
            log(waitlist)
            applytime = userinfo[4]- olduserinfo[4]
            if (userapplytime.get(userinfo[1])!= NaN){
                applytime = applytime + userapplytime.get(userinfo[1])
            }
            userapplytime.put(userinfo[1], applytime)
            log("申请时长:"+ applytime)
            if(checkadmin()){
                if (waitlist[0] == userinfo[1]){
                //if (applytime >= 20 && applytime <25){
                    sendmsgtochat("@"+ userinfo[1] + " 已经等待申请"+ applytime +"秒,即将给予控制权")
                    changeadmin(userinfo[5])
                    waitlist = waitlist.slice(1)
                    userapplytime.remove(userinfo[1])
                    sleep(1000)
                    sendmsgtochat("以下是排队列表:"+ waitlist.join())
                }
            }
        }
    }
    if(olduserinfo[2] == true && userinfo[2] != true){
        log("该用户已经在上周期移交权限")
        usercontroltime.remove(olduserinfo[1])
        usercontroltime.remove(userinfo[1])
    }
    if(olduserinfo[1] != '麦位无人' && userinfo[1] == '麦位无人'){
        log("该用户已经在上周期下麦")
        userkeeptime.remove(olduserinfo[1])
        userkeeptime.remove(userinfo[1])
        usercontroltime.remove(olduserinfo[1])
        usercontroltime.remove(userinfo[1])
        userapplytime.remove(olduserinfo[1])
        userapplytime.remove(userinfo[1])
        if(waitlist.indexOf(userinfo[1]) != -1 ){
            waitlist.push(userinfo[1])
        }
    }
    if(olduserinfo[1] == '麦位无人' && userinfo[1] != '麦位无人'){
        log("该用户已经在上周期上麦")
    }
}

function checkadmin(){
    房主 = id("live_user_grid_container").className("android.widget.HorizontalScrollView").findOne(50).child(0).child(0);
    if (房主.child(1).text() == "1P-主控" || 房主.child(1).text() == "正在玩"){
        return true
    }else{
        return false
    }
}


//转移控制权
function changeadmin(user){
    if(user.child(1).text() == "想玩"){
        user.child(0).child(0).click()
        sleep(500)
        转控按钮 = text("移交控制权").id("action_name").findOne(50).parent().child(0);
        转控按钮.click();
        sleep(500)
        移交主控 = className("android.widget.Button").id("switch_master_control").text("转交主控权");
        移交主控.click();
    }else{
        return
    }
}

//获取控制权
function getadmin(user){
    if(user.child(1).text() == "1P-主控" || user.child(1).text() == "正在玩"){
        user.child(0).child(0).click();
        sleep(500)
        回收按钮 = text("回收控制权").id("action_name").findOne(50).parent().child(0);
        回收按钮.click();
        sleep(500)
        稍后 = text("稍后").className("android.widget.Button").id("dialog_cancel");
        稍后.click();
    }else{
        return
    }
}

//弹出框
function myAlert(val) {
    sleep(500);
    alert('温馨提示', val);
}

//发送语句
function sendmsgtochat(msg) {
    sleep(500)
    var 输入框 = className("EditText").findOne(50);
    输入框.setText(msg);
    sleep(500);
    shell("input keyevent 66",true);
    shell("input keyevent 66",true);
    shell("input keyevent 66",true);
    shell("input keyevent 66",true);
    shell("input keyevent 66",true);
    shell("input keyevent 66",true);
    shell("input keyevent 66",true);
    shell("input keyevent 66",true);
    shell("input keyevent 66",true);
    shell("input keyevent 66",true);
}
