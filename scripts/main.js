Events.on(ClientLoadEvent, function(e) {
    const scope = Vars.mods.getScripts().scope;

    const states = {
        god: false, fly: false, shield: false, creative: false, editor: false, instant: false
    };

    const cmdList = {
        god: { desc: "Бессмертие юнита", act: function() { const u = Vars.player.unit(); if(!u) return "Ошибка: нет юнита"; states.god = !states.god; u.health = states.god ? 999999 : u.maxHealth; return "God Mode: " + (states.god ? "ВКЛ" : "ВЫКЛ"); }},
        fly: { desc: "Полет юнита", act: function() { const u = Vars.player.unit(); if(!u) return "Ошибка: нет юнита"; states.fly = !states.fly; u.type.flying = states.fly; return "Fly: " + (states.fly ? "ВКЛ" : "ВЫКЛ"); }},
        shield: { desc: "Личный щит", act: function() { const u = Vars.player.unit(); if(!u) return "Ошибка: нет юнита"; states.shield = !states.shield; u.shield = states.shield ? 9999 : 0; return "Shield: " + (states.shield ? "ВКЛ" : "ВЫКЛ"); }},
        heal: { desc: "Починить все здания", act: function() { Groups.build.each(b => { if(b.team == Vars.player.team()) b.health = b.maxHealth; }); return "Здания починены"; }},
        unwreck: { desc: "Восстановить разрушенные блоки", act: function() { Groups.build.each(b => { if(b.team == Vars.player.team()) b.heal(); }); return "Восстановление запущено"; }},
        ammo: { desc: "Зарядить все турели", act: function() { Groups.build.each(b => { if(b.team == Vars.player.team() && b.ammo != null) b.ammo = 999; }); return "Турели заряжены"; }},
        fill: { desc: "Наполнить ядро", act: function() { const c = Vars.player.unit()?.core(); if(!c) return "Ошибка: нет ядра"; Vars.content.items().each(i => c.items.set(i, c.storageCapacity)); return "Ядро наполнено"; }},
        speed: { desc: "Скорость юнита x5", act: function() { const u = Vars.player.unit(); if(!u) return "Ошибка: нет юнита"; u.speedMultiplier = 5; return "Скорость x5"; }},
        creative: { desc: "Бесконечные ресурсы", act: function() { states.creative = !states.creative; Vars.state.rules.infiniteResources = states.creative; return "Creative: " + (states.creative ? "ВКЛ" : "ВЫКЛ"); }},
        editor: { desc: "Режим редактора", act: function() { states.editor = !states.editor; Vars.state.rules.editor = states.editor; return "Editor: " + (states.editor ? "ВКЛ" : "ВЫКЛ"); }},
        instant: { desc: "Мгновенная постройка", act: function() { states.instant = !states.instant; Vars.state.rules.buildSpeedMultiplier = states.instant ? 9999 : 1; return "Instant Build: " + (states.instant ? "ВКЛ" : "ВЫКЛ"); }},
        wave: { desc: "Пропустить волну", act: function() { Vars.logic.skipWave(); return "Волна пропущена"; }},
        kill: { desc: "Убить врагов", act: function() { Groups.unit.each(u => { if(u.team != Vars.player.team()) u.kill(); }); return "Враги уничтожены"; }},
        wreck: { desc: "Удалить вражеские здания", act: function() { Groups.build.each(b => { if(b.team != Vars.player.team()) b.kill(); }); return "Здания удалены"; }},
        neutral: { desc: "Нейтрализовать врагов", act: function() { Groups.unit.each(u => { if(u.team != Vars.player.team()) u.team = Team.derelict; }); return "Враги нейтральны"; }},
        dump: { desc: "Очистить ядро", act: function() { const c = Vars.player.unit()?.core(); if(!c) return "Ошибка: нет ядра"; c.items.clear(); return "Ядро очищено"; }},
        spawn: { desc: "Создать 5 юнитов", act: function() { const u = Vars.player.unit(); if(!u) return "Ошибка: нет юнита"; for(let i=0; i<5; i++) u.type.spawn(Vars.player.team(), u.x, u.y); return "Юниты созданы"; }},
        win: { desc: "Победа", act: function() { Events.fire(new SectorCaptureEvent(Vars.state.rules.sector)); return "Победа!"; }},
        lose: { desc: "Сброс сектора", act: function() { Vars.logic.reset(); return "Сектор сброшен"; }},
        research: { desc: "Открыть технологии", act: function() { Vars.content.each(c => { if(c.unlock != null) c.unlock(); }); return "Технологии открыты"; }},
        reset: { desc: "Сброс всех читов", act: function() { for(let k in states) states[k] = false; Vars.state.rules.infiniteResources = false; Vars.state.rules.buildSpeedMultiplier = 1; Vars.state.rules.editor = false; return "Все читы сброшены"; }}
    };

    for (let name in cmdList) {
        (function(n) {
            Object.defineProperty(scope, n, { get: function() {
                let res = cmdList[n].act();
                Log.info("[#00ff00]>> " + res + "[]");
                return "";
            }});
        })(name);
    }

    Object.defineProperty(scope, "help", { get: function() {
        Log.info("\n[#00ffff]=== UltraScript List ===[]");
        for (let name in cmdList) Log.info("[#ffff00]" + name + "[] — " + cmdList[name].desc);
        return "";
    }});
});
            
