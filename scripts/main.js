Events.on(ClientLoadEvent, function(e) {
    var scope = Vars.mods.getScripts().scope;

    var commands = {
        god: { 
            desc: "Бессмертие (бесконечное здоровье)", 
            action: function() { 
                var u = Vars.player.unit(); 
                if (u) u.health = (u.health >= 999999 ? u.maxHealth : 999999); 
                return "God Mode: " + (u && u.health == 999999 ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        fly: { 
            desc: "Полет (проход сквозь стены)", 
            action: function() { 
                var u = Vars.player.unit(); 
                if (u) { u.type.flying = !u.type.flying; u.type.canClip = u.type.flying; } 
                return "Fly: " + (u && u.type.flying ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        shield: { 
            desc: "Создать огромный щит", 
            action: function() { 
                var u = Vars.player.unit(); 
                if (u) u.shield = (u.shield > 0 ? 0 : 9999); 
                return "Shield: " + (u && u.shield > 0 ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        heal: { 
            desc: "Починить все здания в команде", 
            action: function() { 
                Groups.build.each(function(b) { if (b.team == Vars.player.team()) b.health = b.maxHealth; }); 
                return "Все постройки починены"; 
            } 
        },
        unwreck: { 
            desc: "Полностью восстановить разрушенные блоки (фантомы)", 
            action: function() { 
                Groups.build.each(function(b) { if (b.team == Vars.player.team() && b.health <= 0) b.heal(); }); 
                return "Разрушенные постройки восстановлены"; 
            } 
        },
        ammo: { 
            desc: "Зарядить все турели", 
            action: function() { 
                Groups.build.each(function(b) { 
                    if (b.team == Vars.player.team() && b instanceof Turret.TurretBuild) { 
                        b.ammo.clear(); 
                        Vars.content.items().each(function(i) { if (b.type.ammoTypes.containsKey(i)) b.ammo.add(i, 999); }); 
                    } 
                }); 
                return "Все турели заряжены"; 
            } 
        },
        fill: { 
            desc: "Заполнить ядро ресурсами текущей планеты", 
            action: function() { 
                var core = Vars.player.unit().core(); 
                if (core) { 
                    Vars.content.items().each(function(i) { if (i.unlockedNow()) { core.items.set(i, core.storageCapacity); } }); 
                    return "Ядро заполнено ресурсами планеты"; 
                } 
                return "Ядро не найдено"; 
            } 
        },
        speed: { 
            desc: "Ускорить скорость передвижения", 
            action: function() { 
                var u = Vars.player.unit(); 
                if (u) { u.type.speed *= 5; } 
                return "Скорость увеличена"; 
            } 
        },
        creative: { 
            desc: "Бесконечные ресурсы", 
            action: function() { 
                Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources; 
                return "Creative: " + Vars.state.rules.infiniteResources; 
            } 
        },
        editor: { 
            desc: "Режим редактора", 
            action: function() { 
                Vars.state.rules.editor = !Vars.state.rules.editor; 
                return "Editor: " + Vars.state.rules.editor; 
            } 
        },
        instant: { 
            desc: "Мгновенная постройка", 
            action: function() { 
                Vars.state.rules.buildSpeedMultiplier = 9999; 
                return "Instant build: ВКЛ"; 
            } 
        },
        immortal: { 
            desc: "Бессмертные здания", 
            action: function() { 
                Vars.state.rules.blockHealthMultiplier = 99999; 
                return "Immortal blocks: ВКЛ"; 
            } 
        },
        fog: { 
            desc: "Убрать туман войны", 
            action: function() { 
                Vars.state.rules.fog = !Vars.state.rules.fog; 
                return "Fog: " + Vars.state.rules.fog; 
            } 
        },
        boost: { 
            desc: "Ускорить производство в 100 раз", 
            action: function() { 
                Vars.state.rules.productionSpeedMultiplier = 100; 
                return "Production boosted"; 
            } 
        },
        time: { 
            desc: "Ускорить время в 3 раза", 
            action: function() { 
                Time.setDeltaProvider(function() { return Core.graphics.getDeltaTime() * 60 * 3; }); 
                return "Time boosted"; 
            } 
        },
        wave: { 
            desc: "Пропустить волну", 
            action: function() { 
                Vars.logic.skipWave(); 
                return "Волна пропущена"; 
            } 
        },
        kill: { 
            desc: "Убить всех врагов", 
            action: function() { 
                Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); 
                return "Враги уничтожены"; 
            } 
        },
        wreck: { 
            desc: "Удалить все вражеские здания", 
            action: function() { 
                Groups.build.each(function(b) { if (b.team != Vars.player.team()) b.kill(); }); 
                return "Здания разрушены"; 
            } 
        },
        neutral: { 
            desc: "Сделать всех врагов на карте нейтральными", 
            action: function() { 
                Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.team(Team.derelict); }); 
                return "Враги деактивированы"; 
            } 
        },
        dump: { 
            desc: "Очистить ядро", 
            action: function() { 
                var core = Vars.player.unit().core(); 
                if (core) core.items.clear(); 
                return "Ядро очищено"; 
            } 
        },
        spawn: { 
            desc: "Создать 5 юнитов игрока", 
            action: function() { 
                for (var i = 0; i < 5; i++) { 
                    var u = Vars.player.unit().type.create(Vars.player.team()); 
                    u.set(Vars.player.x, Vars.player.y); 
                    u.add(); 
                } 
                return "Юниты созданы"; 
            } 
        },
        win: { 
            desc: "Мгновенная победа", 
            action: function() { 
                Events.fire(new SectorCaptureEvent(Vars.state.getSector())); 
                return "Победа!"; 
            } 
        },
        lose: { 
            desc: "Сбросить сектор и волны к началу", 
            action: function() { 
                Vars.state.wave = 1; 
                Vars.logic.reset(); 
                return "Сектор полностью сброшен к началу"; 
            } 
        },
        research: { 
            desc: "Открыть все технологии", 
            action: function() { 
                Vars.content.each(function(c) { if (c instanceof UnlockableContent) c.quietUnlock(); }); 
                return "Все технологии открыты"; 
            } 
        },
        team: { 
            desc: "Сменить команду", 
            action: function() { 
                var u = Vars.player.unit(); 
                if (u) { u.team(u.team() == Team.sharded ? Team.crux : Team.sharded); } 
                return "Команда сменена"; 
            } 
        }
    };

    function showVisualMenu() {
        var dialog = new BaseDialog("UltraScript Menu");
        dialog.addCloseButton();
        
        var table = dialog.cont;
        table.pane(function(p) {
            p.add("[cyan]СПИСОК ВСЕХ КОМАНД:[]").padBottom(10).row();
            for (var name in commands) {
                p.add("[orange]" + name + "[] - " + commands[name].desc).left().padBottom(4).row();
            }
        }).size(450, 500);
        
        dialog.show();
    }

    for (var name in commands) {
        (function(cmdName) {
            scope[cmdName] = function() {
                var result = commands[cmdName].action();
                Log.info(">>> " + result);
            };
        })(name);
    }

    scope.menu = function() {
        showVisualMenu();
        return "Графическое меню открыто";
    };

    Events.on(WorldLoadEvent, function() {
        Time.run(60, function() {
            showVisualMenu();
        });
    });
});
    
