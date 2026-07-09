Events.on(ClientLoadEvent, function(e) {
    var scope = Vars.mods.getScripts().scope;

    var states = {};
    var commands = {
        god: { 
            desc: "Бессмертие (бесконечное здоровье)", 
            isToggle: true,
            action: function() { 
                var u = Vars.player.unit(); 
                states.god = !states.god;
                if (u) u.health = states.god ? 999999 : u.maxHealth; 
                return "God Mode: " + (states.god ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        fly: { 
            desc: "Полет (проход сквозь стены)", 
            isToggle: true,
            action: function() { 
                var u = Vars.player.unit(); 
                states.fly = !states.fly;
                if (u) { u.type.flying = states.fly; u.type.canClip = states.fly; } 
                return "Fly: " + (states.fly ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        shield: { 
            desc: "Создать огромный щит", 
            isToggle: true,
            action: function() { 
                var u = Vars.player.unit(); 
                states.shield = !states.shield;
                if (u) u.shield = states.shield ? 9999 : 0; 
                return "Shield: " + (states.shield ? "ВКЛ" : "ВЫКЛ"); 
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
            isToggle: true,
            action: function() { 
                var u = Vars.player.unit(); 
                states.speed = !states.speed;
                if (u) { u.type.speed = states.speed ? u.type.speed * 5 : u.type.speed / 5; } 
                return "Скорость: " + (states.speed ? "Увеличена" : "Норма"); 
            } 
        },
        creative: { 
            desc: "Бесконечные ресурсы", 
            isToggle: true,
            action: function() { 
                Vars.state.rules.infiniteResources = !Vars.state.rules.infiniteResources; 
                return "Creative: " + (Vars.state.rules.infiniteResources ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        editor: { 
            desc: "Режим редактора", 
            isToggle: true,
            action: function() { 
                Vars.state.rules.editor = !Vars.state.rules.editor; 
                return "Editor: " + (Vars.state.rules.editor ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        instant: { 
            desc: "Мгновенная постройка", 
            isToggle: true,
            action: function() { 
                states.instant = !states.instant;
                Vars.state.rules.buildSpeedMultiplier = states.instant ? 9999 : 1; 
                return "Instant build: " + (states.instant ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        immortal: { 
            desc: "Бессмертные здания", 
            isToggle: true,
            action: function() { 
                states.immortal = !states.immortal;
                Vars.state.rules.blockHealthMultiplier = states.immortal ? 99999 : 1; 
                return "Immortal blocks: " + (states.immortal ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        fog: { 
            desc: "Убрать туман войны", 
            isToggle: true,
            action: function() { 
                Vars.state.rules.fog = !Vars.state.rules.fog; 
                return "Fog: " + (Vars.state.rules.fog ? "ВЫКЛ" : "ВКЛ"); 
            } 
        },
        boost: { 
            desc: "Ускорить производство в 100 раз", 
            isToggle: true,
            action: function() { 
                states.boost = !states.boost;
                Vars.state.rules.productionSpeedMultiplier = states.boost ? 100 : 1; 
                return "Production boost: " + (states.boost ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        time: { 
            desc: "Ускорить время в 3 раза", 
            isToggle: true,
            action: function() { 
                states.time = !states.time;
                Time.setDeltaProvider(states.time ? function() { return Core.graphics.getDeltaTime() * 60 * 3; } : null); 
                return "Time boost: " + (states.time ? "ВКЛ" : "ВЫКЛ"); 
            } 
        },
        wave: { 
            desc: "Пропустить волну", 
            action: function() { Vars.logic.skipWave(); return "Волна пропущена"; } 
        },
        kill: { 
            desc: "Убить всех врагов", 
            action: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.kill(); }); return "Враги уничтожены"; } 
        },
        wreck: { 
            desc: "Удалить все вражеские здания", 
            action: function() { Groups.build.each(function(b) { if (b.team != Vars.player.team()) b.kill(); }); return "Здания разрушены"; } 
        },
        neutral: { 
            desc: "Сделать всех врагов на карте нейтральными", 
            action: function() { Groups.unit.each(function(u) { if (u.team != Vars.player.team()) u.team(Team.derelict); }); return "Враги деактивированы"; } 
        },
        dump: { 
            desc: "Очистить ядро", 
            action: function() { var core = Vars.player.unit().core(); if (core) core.items.clear(); return "Ядро очищено"; } 
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
            action: function() { Events.fire(new SectorCaptureEvent(Vars.state.getSector())); return "Победа!"; } 
        },
        lose: { 
            desc: "Сбросить сектор и волны к началу", 
            action: function() { Vars.state.wave = 1; Vars.logic.reset(); return "Сектор сброшен к началу"; } 
        },
        research: { 
            desc: "Открыть все технологии", 
            action: function() { Vars.content.each(function(c) { if (c instanceof UnlockableContent) c.quietUnlock(); }); return "Все технологии открыты"; } 
        },
        team: { 
            desc: "Сменить команду", 
            action: function() { var u = Vars.player.unit(); if (u) { u.team(u.team() == Team.sharded ? Team.crux : Team.sharded); } return "Команда сменена"; } 
        }
    };

    // Инициализация дефолтных состояний переключателей
    for (var key in commands) { if (commands[key].isToggle) states[key] = false; }

    var menuVisible = false;
    var mainTable = null;

    function showConsoleHelp() {
        Log.info("\n=== СПИСОК ВСЕХ КОМАНД ===");
        for (var name in commands) {
            Log.info(name + " : " + commands[name].desc);
        }
        Log.info("==================================\n");
    }

    function toggleCheatInterface() {
        if (mainTable != null) {
            mainTable.remove();
            mainTable = null;
            menuVisible = false;
            Vars.ui.hudfrag.showToast("Cheat Interface: OFF");
            return;
        }

        mainTable = new Table();
        Vars.ui.hudGroup.addChild(mainTable);

        mainTable.update(function() {
            var infoTable = Vars.ui.hudfrag.blockfrag.topTable;
            if (infoTable != null) {
                var pos = Screen.getPos(infoTable);
                mainTable.setPosition(pos.x + infoTable.getWidth() / 2, pos.y - 45);
            }
        });

        mainTable.button(Icon.settings, Styles.clearTogglei, function() {
            menuVisible = !menuVisible;
            rebuildMenu();
        }).size(40, 40);

        rebuildMenu();
        Vars.ui.hudfrag.showToast("Cheat Interface: ON");
    }

    function rebuildMenu() {
        if (mainTable == null) return;
        if (mainTable.getChildren().size > 1) mainTable.getChildren().get(1).remove();
        if (!menuVisible) return;

        var menuDialog = new Table(Styles.black6);
        menuDialog.pane(function(p) {
            for (var name in commands) {
                (function(cmdName) {
                    var isTgl = commands[cmdName].isToggle;
                    
                    var getBtnText = function() {
                        if (isTgl) return cmdName + " (" + (states[cmdName] ? "ВКЛ" : "ВЫКЛ") + ")";
                        return cmdName;
                    };

                    var btn = p.button(getBtnText(), Styles.flatBtc, function() {
                        var res = commands[cmdName].action();
                        Vars.ui.hudfrag.showToast(res);
                        if (isTgl) this.setText(getBtnText());
                    }).width(160).pad(2).get();

                    p.add(commands[cmdName].desc).left().padLeft(8).padBottom(4).row();
                })(name);
            }
        }).size(420, 280);

        mainTable.add(menuDialog).padTop(5);
    }

    for (var name in commands) {
        (function(cmdName) {
            scope[cmdName] = function() {
                var result = commands[cmdName].action();
                Log.info(">>> " + result);
                return result;
            };
        })(name);
    }

    scope.help = function() {
        showConsoleHelp();
        return "Список команд отправлен в консоль.";
    };

    scope.cheat = function() {
        toggleCheatInterface();
        return "Переключение видимости интерфейса.";
    };

    Events.on(WorldLoadEvent, function() {
        showConsoleHelp();
        if (mainTable != null) {
            mainTable.remove();
            mainTable = null;
            menuVisible = false;
        }
    });
});
                                        
