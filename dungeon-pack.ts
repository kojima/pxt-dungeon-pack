/**
 * ダンジョンパック
 * https://github.com/microsoft/pxt-common-packages/blob/master/libs/game/animation.ts#L589
 */
//% weight=150 color=#e67e22 icon="\uf3ed" block="ダンジョンパック"
namespace dungeon_pack {
    const stateNamespace = "__dungeon_pack";

    type AnimationHandlers = {
        angleHandlerRegistered?: boolean,
        moveHandlerRegistered?: boolean,
        attackHandlerRegistered?: boolean,
        itemHandlerRegistered?: boolean,
    }

    enum SpriteDirection {
        UP,
        RIGHT,
        DOWN,
        LEFT
    }

    type AngleData = {
        direction: SpriteDirection,
        value: number,
        active: boolean
    }

    type MoveData = {
        elaspedTime: number,
        frameInterval: number,
        direction: SpriteDirection,
        currentFrames: Image[],
        upFrames: Image[],
        upLastFrame: number,
        upLastUpdated: number,
        rightFrames: Image[],
        rightLastFrame: number,
        rightLastUpdated: number,
        downFrames: Image[],
        downLastFrame: number,
        downLastUpdated: number,
        leftFrames: Image[],
        leftLastFrame: number,
        leftLastUpdated: number
    }

    type AttackData = {
        attackingSprite: Sprite | null,
        kind: number,
        elaspedTime: number,
        frameInterval: number,
        offset: number,
        attacking: boolean,
        direction: SpriteDirection,
        lastFrame: number,
        lastUpdated: number,
        upFrames: Image[],
        rightFrames: Image[],
        downFrames: Image[],
        leftFrames: Image[],
        upSpriteFrames: Image[],
        rightSpriteFrames: Image[],
        downSpriteFrames: Image[],
        leftSpriteFrames: Image[]
    }

    type SpriteDungeonPackData = {
        sprite: Sprite,
        angle?: AngleData,
        move?: MoveData,
        attack?: AttackData,
        items?: Sprite[]
    }


    /**
     * スプライトの向きを管理する
     */
    //% block="$sprite=variables_get(mySprite) の向きを管理する"
    //% weight=101
    export function manageDirection(sprite: Sprite) {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
        }

        let handlers = game.currentScene().data[`${stateNamespace}_handlers`] as AnimationHandlers
        if (!handlers || !handlers.angleHandlerRegistered) {
            if (!handlers) handlers = {angleHandlerRegistered: true}
            else handlers.angleHandlerRegistered = true

            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteDungeonPackData = spriteDicts[spriteId]
                    if (!data.angle || data.angle.active) {
                        continue
                    }
                    const sprite = data.sprite
                    if (sprite.vx === 0 && sprite.vy === 0) {
                        continue
                    }
                    data.angle.value = Math.atan2(sprite.vy, sprite.vx)
                    if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                        if (sprite.vx > 0) {
                            data.angle.direction = SpriteDirection.RIGHT
                        } else {
                            data.angle.direction = SpriteDirection.LEFT
                        }
                    } else {
                        if (sprite.vy > 0) {
                            data.angle.direction = SpriteDirection.DOWN
                        } else {
                            data.angle.direction = SpriteDirection.UP
                        }
                    }
                }
            })
        }
        game.currentScene().data[`${stateNamespace}_handlers`] = handlers
        sprite.onDestroyed(() => {
            spriteDicts[sprite.id].active = false
        })
        const data = {
            direction: SpriteDirection.DOWN,
            value: Math.PI * 0.5,
            active: true
        } as AngleData
        if (spriteDicts[sprite.id]) {
            spriteDicts[sprite.id].angle = data
        } else {
            spriteDicts[sprite.id] = {
                sprite: sprite,
                angle: data
            } as SpriteDungeonPackData
        }
    }

    /**
     * 移動アニメーションを設定する
     */
    //% block="移動アニメーションを設定する $sprite=variables_get(mySprite) 上方向 $upFrames=animation_editor 右方向 $rightFrames=animation_editor 下方向 $downFrames=animation_editor 左方向 $leftFrames=animation_editor フレーム間隔 (ms) $frameInterval=timePicker"
    //% frameInterval.defl=100
    //% weight=100
    export function setMoveAnimation(sprite: Sprite, upFrames: Image[], rightFrames: Image[], downFrames: Image[], leftFrames: Image[], frameInterval?: number) {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
        }
        let handlers = game.currentScene().data[`${stateNamespace}_handlers`] as AnimationHandlers
        if (!handlers || !handlers.moveHandlerRegistered) {
            if (!handlers) handlers = { moveHandlerRegistered: true }
            else handlers.moveHandlerRegistered = true

            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteDungeonPackData = spriteDicts[spriteId]
                    const sprite = data.sprite
                    if (sprite.vx === 0 && sprite.vy === 0) {
                        if (data.attack && data.attack.attacking) continue

                        const image = data.move.currentFrames[0]
                        if (sprite.image !== image) sprite.setImage(image)
                        data.move.upLastFrame = 0
                        data.move.rightLastFrame = 0
                        data.move.downLastFrame = 0
                        data.move.leftLastFrame = 0
                        continue
                    }

                    data.move.elaspedTime += game.eventContext().deltaTimeMillis
                    if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                        if (sprite.vx > 0) {
                            data.move.direction = SpriteDirection.RIGHT
                            if (data.move.elaspedTime - data.move.rightLastUpdated > data.move.frameInterval) {
                                data.move.rightLastUpdated = data.move.elaspedTime
                                data.move.rightLastFrame = (data.move.rightLastFrame + 1) % data.move.rightFrames.length
                                const image = data.move.rightFrames[data.move.rightLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.move.currentFrames = data.move.rightFrames
                            }
                        } else if (sprite.vx < 0) {
                            data.move.direction = SpriteDirection.LEFT
                            if (data.move.elaspedTime - data.move.leftLastUpdated > data.move.frameInterval) {
                                data.move.leftLastUpdated = data.move.elaspedTime
                                data.move.leftLastFrame = (data.move.leftLastFrame + 1) % data.move.leftFrames.length
                                const image = data.move.leftFrames[data.move.leftLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.move.currentFrames = data.move.leftFrames
                            }
                        }
                    } else {
                        if (sprite.vy > 0) {
                            data.move.direction = SpriteDirection.DOWN
                            if (data.move.elaspedTime - data.move.downLastUpdated > data.move.frameInterval) {
                                data.move.downLastUpdated = data.move.elaspedTime
                                data.move.downLastFrame = (data.move.downLastFrame + 1) % data.move.downFrames.length
                                const image = data.move.downFrames[data.move.downLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.move.currentFrames = data.move.downFrames
                            }
                        } else if (sprite.vy < 0) {
                            data.move.direction = SpriteDirection.UP
                            if (data.move.elaspedTime - data.move.upLastUpdated > data.move.frameInterval) {
                                data.move.upLastUpdated = data.move.elaspedTime
                                data.move.upLastFrame = (data.move.upLastFrame + 1) % data.move.upFrames.length
                                const image = data.move.upFrames[data.move.upLastFrame]
                                if (sprite.image !== image) sprite.setImage(image)
                                data.move.currentFrames = data.move.upFrames
                            }
                        }
                    }
                }
            })
        }
        game.currentScene().data[`${stateNamespace}_handlers`] = handlers
        /*
        sprite.onDestroyed(() => {
            delete spriteDicts[sprite.id]
        })
        */
        const data = {
            elaspedTime: 0,
            frameInterval: frameInterval,
            direction: SpriteDirection.DOWN,
            currentFrames: [sprite.image],
            upFrames: upFrames,
            upLastFrame: 0,
            upLastUpdated: 0,
            rightFrames: rightFrames,
            rightLastFrame: 0,
            rightLastUpdated: 0,
            downFrames: downFrames,
            downLastFrame: 0,
            downLastUpdated: 0,
            leftFrames: leftFrames,
            leftLastFrame: 0,
            leftLastUpdated: 0

        } as MoveData
        if (spriteDicts[sprite.id]) {
            spriteDicts[sprite.id].move = data
        } else {
            spriteDicts[sprite.id] = {
                sprite: sprite,
                move: data
            } as SpriteDungeonPackData
        }
    }

    function getAttackingSpritePosition(sprite: Sprite, direction: SpriteDirection, offset: number) {
        let x = sprite.x
        let y = sprite.y
        if (direction === SpriteDirection.UP) {
            y = sprite.y - offset
        } else if (direction === SpriteDirection.RIGHT) {
            x = sprite.x + offset
        } else if (direction === SpriteDirection.DOWN) {
            y = y + offset
        } else if (direction === SpriteDirection.LEFT) {
            x = x - offset
        }
        return {x: x, y: y}
    }

    /**
     * 攻撃アニメーションを設定する
     */
    //% block="攻撃アニメーションを設定する $sprite=variables_get(mySprite) 上方向 $upFrames=animation_editor 右方向 $rightFrames=animation_editor 下方向 $downFrames=animation_editor 左方向 $leftFrames=animation_editor 武器タイプ %kind=spritekind オフセット (px) %offset フレーム間隔 (ms) $frameInterval=timePicker || スプライト上方向　$upSpriteFrames=animation_editor スプライト右方向　$rightSpriteFrames=animation_editor スプライト下方向　$downSpriteFrames=animation_editor スプライト左方向　$leftSpriteFrames=animation_editor"
    //% offset.defl=0
    //% frameInterval.defl=100
    //% upSpriteFrames.defl=[]
    //% rightSpriteFrames.defl=[]
    //% downSpriteFrames.defl=[]
    //% leftSpriteFrames.defl=[]
    //% expandableArgumentMode="toggle"
    //% weight=99
    export function setAttackAnimation(sprite: Sprite, upFrames: Image[], rightFrames: Image[], downFrames: Image[], leftFrames: Image[], kind: number, offset: number, frameInterval: number,
        upSpriteFrames?: Image[], rightSpriteFrames?: Image[], downSpriteFrames?: Image[], leftSpriteFrames?: Image[]) {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
        }
        let handlers = game.currentScene().data[`${stateNamespace}_handlers`] as AnimationHandlers
        if (!handlers || !handlers.attackHandlerRegistered) {
            if (!handlers) handlers = { attackHandlerRegistered: true }
            else handlers.attackHandlerRegistered = true

            game.eventContext().registerFrameHandler(scene.FOLLOW_SPRITE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteDungeonPackData = spriteDicts[spriteId]
                    const sprite = data.sprite
                    if (Math.abs(sprite.vx) > Math.abs(sprite.vy)) {
                        if (sprite.vx > 0) {
                            data.attack.direction = SpriteDirection.RIGHT
                        } else if (sprite.vx < 0) {
                            data.attack.direction = SpriteDirection.LEFT
                        }
                    } else {
                        if (sprite.vy > 0) {
                            data.attack.direction = SpriteDirection.DOWN
                        } else if (sprite.vy < 0) {
                            data.attack.direction = SpriteDirection.UP
                        }
                    }
                    if (data.attack && data.attack.attacking && data.attack.attackingSprite) {
                        const pos = getAttackingSpritePosition(data.sprite, data.attack.direction, data.attack.offset)
                        data.sprite.setVelocity(0, 0)
                        data.attack.attackingSprite.setPosition(pos.x, pos.y)
                    }
                }
            })
            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                const spriteIds = Object.keys(spriteDicts)
                for (let i = 0; i < spriteIds.length; i++) {
                    const spriteId = spriteIds[i]
                    const data: SpriteDungeonPackData = spriteDicts[spriteId]
                    const sprite = data.sprite
                    if (data.attack && data.attack.attacking) {
                        let frames: Image[] = []
                        let spriteFrames: Image[] = []
                        if (data.attack.direction === SpriteDirection.UP) {
                            frames = data.attack.upFrames
                            spriteFrames = data.attack.upSpriteFrames
                        } else if (data.attack.direction === SpriteDirection.RIGHT) {
                            frames = data.attack.rightFrames
                            spriteFrames = data.attack.rightSpriteFrames
                        } else if (data.attack.direction === SpriteDirection.DOWN) {
                            frames = data.attack.downFrames
                            spriteFrames = data.attack.downSpriteFrames
                        } else if (data.attack.direction === SpriteDirection.LEFT) {
                            frames = data.attack.leftFrames
                            spriteFrames = data.attack.leftSpriteFrames
                        }
                        data.attack.elaspedTime += game.eventContext().deltaTimeMillis
                        if (data.attack.elaspedTime - data.attack.lastUpdated > data.attack.frameInterval) {
                            data.attack.lastUpdated = data.attack.elaspedTime
                            data.attack.lastFrame += 1
                            if (data.attack.lastFrame === 0) {
                                if (data.attack.attackingSprite) data.attack.attackingSprite.destroy()
                                data.attack.attackingSprite = sprites.create(frames[0], kind)
                                const pos = getAttackingSpritePosition(data.sprite, data.attack.direction, data.attack.offset)
                                data.attack.attackingSprite.setPosition(pos.x, pos.y)
                                data.attack.attackingSprite.z = data.sprite.z - 1
                            }
                            if (data.attack.lastFrame < frames.length) {
                                const image = frames[data.attack.lastFrame]
                                if (data.attack.attackingSprite.image !== image) {
                                    data.attack.attackingSprite.setImage(image)
                                }
                                if (spriteFrames && spriteFrames.length > 1) {
                                    const image = spriteFrames[data.attack.lastFrame]
                                    if (data.sprite.image !== image) {
                                        data.sprite.setImage(image)
                                    }
                                }
                            } else {
                                if (data.attack.attackingSprite) data.attack.attackingSprite.destroy()
                                if (spriteFrames && spriteFrames.length > 1) {
                                    const image = spriteFrames[0]
                                    data.sprite.setImage(image)
                                }
                                data.attack.attacking = false
                            }
                        }
                    }
                }
            })
        }
        game.currentScene().data[`${stateNamespace}_handlers`] = handlers
        const data = {
            attackingSprite: null,
            kind: kind,
            elaspedTime: 0,
            frameInterval: frameInterval,
            offset: offset,
            currentFrames: [sprite.image],
            attacking: false,
            direction: SpriteDirection.DOWN,
            lastFrame: -1,
            lastUpdated: 0,
            upFrames: upFrames,
            rightFrames: rightFrames,
            downFrames: downFrames,
            leftFrames: leftFrames,
            upSpriteFrames: upSpriteFrames,
            rightSpriteFrames: rightSpriteFrames,
            downSpriteFrames: downSpriteFrames,
            leftSpriteFrames: leftSpriteFrames
        } as AttackData
        if (spriteDicts[sprite.id]) {
            spriteDicts[sprite.id].attack = data
        } else {
            spriteDicts[sprite.id] = {
                sprite: sprite,
                attack: data
            } as SpriteDungeonPackData
        }
        /*
        sprite.onDestroyed(() => {
            delete spriteDicts[sprite.id]
        })
        */
    }

    /**
     * 攻撃する
     */
    //% block="$sprite=variables_get(mySprite) が攻撃する"
    //% weight=98
    export function attack(sprite: Sprite) {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
        }
        const data = spriteDicts[sprite.id] as SpriteDungeonPackData
        if (!data || data.attack.attacking) return

        data.attack.attacking = true
        data.attack.lastFrame = -1
        data.attack.lastUpdated = 0
    }

    /**
     * 発射体を発射する
     */
    //% block="発射体を発射する $sprite=variables_get(mySprite) 上方向 $upFrames=animation_editor 右方向 $rightFrames=animation_editor 下方向 $downFrames=animation_editor 左方向 $leftFrames=animation_editor 速度 %velocity 武器タイプ %kind=spritekind オフセット (px) %offset フレーム間隔 (ms) $frameInterval=timePicker"
    //% velocity.defl=50
    //% offset.defl=0
    //% frameInterval.defl=100
    //% weight=97
    export function shootProjectile(sprite: Sprite, upFrames: Image[], rightFrames: Image[], downFrames: Image[], leftFrames: Image[], velocity: number, kind: number, offset: number, frameInterval?: number) {
        if (!sprite) return

        let frames: Image[] = downFrames
        let x = sprite.x
        let y = sprite.y + offset
        let vx = 0
        let vy = velocity
        const dataKey = stateNamespace
        let spriteDicts = game.currentScene().data[dataKey]
        if (spriteDicts && spriteDicts[sprite.id]) {
            const data = spriteDicts[sprite.id]
            if (!data.active) {
                return
            }
            x = sprite.x + offset * Math.cos(data.angle)
            y = sprite.y + offset * Math.sin(data.angle)
            vx = velocity * Math.cos(data.angle)
            vy = velocity * Math.sin(data.angle)
            const direction = data.direction
            if (direction === SpriteDirection.UP) {
                frames = upFrames
            } else if (direction === SpriteDirection.RIGHT) {
                frames = rightFrames
            } else if (direction === SpriteDirection.DOWN) {
                frames = downFrames
            } else {
                frames = leftFrames
            }
        }
        const projectile = sprites.create(frames[0], kind)
        projectile.setPosition(x, y)
        projectile.setVelocity(vx, vy)
        projectile.setFlag(SpriteFlag.DestroyOnWall, true)
        projectile.setFlag(SpriteFlag.AutoDestroy, true)
        animation.runImageAnimation(projectile, frames, frameInterval, true)
    }

    /**
     * 全方向に発射体を発射する
     */
    //% block="$sprite=variables_get(mySprite) から$count 方向に発射体$image=screen_image_picker (タイプ %kind=spritekind)を発射する || 速度$velocity オフセット (px) %offset 壁抜け%throughWalls 回転%rotation"
    //% inlineInputMode=inline
    //% expandableArgumentMode="toggle"
    //% count.defl=4
    //% kind.defl=Projectile
    //% velocity.defl=100
    //% offset.defl=0
    //% throughWalls.defl=false
    //% throughWalls.shadow=toggleOnOff
    //% rotation.defl=true
    //% rotation.shadow=toggleOnOff
    //% weight=96
    export function shootProjectileAllAround(sprite: Sprite, count: number, image: Image, kind: number, velocity?: number, offset?: number, throughWalls?: boolean, rotation?: boolean) {
        if (!sprite) return

        for (let i = 0; i < count; i++) {
            const angleDeg = 360 / count * i + (count % 2 === 0 ? 0 : -90)
            const angle = angleDeg * Math.PI / 180
            const offsetX = offset * Math.cos(angle)
            const vx = velocity * Math.cos(angle)
            const offsetY = offset * Math.sin(angle)
            const vy = velocity * Math.sin(angle)
            const projectile = sprites.create(image, kind)
            projectile.setPosition(sprite.x + offsetX, sprite.y + offsetY)
            projectile.setVelocity(vx, vy)
            if (rotation) transformSprites.rotateSprite(projectile, angleDeg)
            projectile.setFlag(SpriteFlag.GhostThroughWalls, throughWalls)
            projectile.setFlag(SpriteFlag.DestroyOnWall, !throughWalls)
            projectile.setFlag(SpriteFlag.AutoDestroy, true);
        }
    }

    /**
     * タイル上にスプライトを生成する
     */
    //% block="スプライト%sprite=screen_image_picker (%kind=spritekind タイプ)をタイル%tile 上に生成する || (速度 vx:%vx , vy:%vy)"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% vx.defl=0
    //% vy.defl=0
    //% weight=95
    export function spawnSpritesOnTiles(sprite: Image, kind: number, tile: Image, vx: number = 0, vy: number = 0) {
        tiles.getTilesByType(tile).forEach(tLoc => {
            const s = sprites.create(sprite, kind)
            tiles.placeOnTile(s, tLoc)
            // line below does not work correctly
            tiles.setTileAt(tLoc, img` `)
            s.setVelocity(vx, vy)
            s.setBounceOnWall(true)
        })
    }

    /**
     * 2スプライト間の距離を取得する
     */
    //% block="%sprite1=variables_get(mySprite) と%sprite2=variables_get(mySprite2) の間の距離"
    //% weight=90
    export function distanceBetween(sprite1: Sprite, sprite2: Sprite): number {
        return Math.sqrt((sprite1.x - sprite2.x) ** 2 + (sprite1.y - sprite2.y) ** 2);
    }

    function _existsWallsBetween(scene: scene.Scene, x1: number, y1: number, x2: number, y2: number): boolean {
        const diffX = x2 - x1;
        const diffY = y2 - y1;
        if (Math.abs(diffX) > 240 || Math.abs(diffY) > 240) return false;
        const dist = Math.sqrt(diffX ** 2 + diffY ** 2);
        const step = dist / scene.tileMap.scale * 0.5;
        const angle = Math.atan(diffY / diffX) + (diffX < 0 ? Math.PI : 0);
        for (let d = 0; d < dist; d += step) {
            const x = x1 + d * Math.cos(angle);
            const y = y1 + d * Math.sin(angle);
            const loc = tiles.getTileLocation(x >> scene.tileMap.scale, y >> scene.tileMap.scale);
            if (tiles.tileAtLocationIsWall(loc)) return true;
        }
        return false;
    }

    /**
     * 2スプライト間に壁が存在するか確認する
     */
    //% block="%sprite1=variables_get(mySprite) と%sprite2=variables_get(mySprite2) の間に壁が存在する || 画面外もチェックする %checkOutOfScreen"
    //% checkOutOfScreen.defl=false
    //% checkOutOfScreen.shadow=toggleOnOff
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% weight=85
    export function existWallsBetween(sprite1: Sprite, sprite2: Sprite, checkOutOfScreen?: boolean): boolean {
        const scene = game.currentScene();
        if (!scene.tileMap) return true;
        if (!checkOutOfScreen && (sprite1.isOutOfScreen(scene.camera) || sprite2.isOutOfScreen(scene.camera))) return true;
        const sprite1HInset = sprite1.width * 0.2;
        const sprite1VInset = sprite1.height * 0.2;
        const sprite2HInset = sprite2.width * 0.2;
        const sprite2VInset = sprite2.height * 0.2;
        return _existsWallsBetween(scene, sprite1.left + sprite1HInset, sprite1.top + sprite1VInset, sprite2.left + sprite2HInset, sprite2.top + sprite2VInset) ||
            _existsWallsBetween(scene, sprite1.right - sprite1HInset, sprite1.top + sprite1VInset, sprite2.right - sprite2HInset, sprite2.top + sprite2VInset) ||
            _existsWallsBetween(scene, sprite1.right - sprite1HInset, sprite1.bottom - sprite1VInset, sprite2.right - sprite2HInset, sprite2.bottom - sprite2VInset) ||
            _existsWallsBetween(scene, sprite1.left + sprite1HInset, sprite1.bottom - sprite1VInset, sprite2.left + sprite2HInset, sprite2.bottom - sprite2VInset);
    }

    /**
     * スプライトが他のスプライトを追跡しているか確認する
     */
    //% block="%following=variables_get(myEnemy) が%followed=variables_get(mySprite) を追跡している"
    //% weight=85
    export function isFollowingSprite(following: Sprite, followed: Sprite): boolean {
        const sc = game.currentScene();
        if (!sc.followingSprites) return false;
        let isFollowing = false;
        sc.followingSprites.forEach(fs => {
            const { target, self, turnRate, rate } = fs;
            if (self.id === following.id && target.id === followed.id) isFollowing = true;
        });
        return isFollowing;
    }


    /**
     * スプライトを追跡を停止する
     */
    //% block="%following=variables_get(myEnemy) の追跡を終了する || 動き続ける %keepMoving"
    //% keepMoving.defl=true
    //% keepMoving.shadow=toggleOnOff
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% weight=80
    export function stopFollowing(sprite: Sprite, keepMoving?: boolean) {
        const sc = game.currentScene();
        if (!sc.followingSprites) return;

        const fs = sc.followingSprites.find(fs => fs.self.id == sprite.id);
        if (!fs) return;

        const speed = fs.rate;
        let vx = keepMoving ? fs.self.vx : 0;
        let vy = keepMoving ? fs.self.vy : 0;
        if (keepMoving && (vx ** 2 + vy ** 2) < speed ** 2 * 0.5) {
            const angle = 2 * Math.PI * Math.random();
            vx = speed * Math.cos(angle);
            vy = speed * Math.sin(angle);
        }
        sprite.vx = vx;
        sprite.vy = vy;
        sc.followingSprites.removeElement(fs);
    }


    /**
     * HPステータスバーをスプライトに設定する
     */
    //% block="HPステータスバーをスプライト%sprite=variables_get(mySprite) に設定する || (幅: %width , 高さ: %height, オフセット: %offset)"
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% width.defl=20
    //% height.defl=4
    //% offset.defl=4
    //% group="HPステータスバー"
    //% weight=94
    export function setHPStatusBarToSprite(sprite: Sprite, width: number = 20, height: number = 4, offset: number = 4) {
        let statusbar = statusbars.create(width, height, StatusBarKind.Health)
        statusbar.attachToSprite(sprite)
        statusbar.setOffsetPadding(0, offset)
    }

    /**
     * HPステータスバーをスプライトタイプに設定する
     */
    //% block="HPステータスバーをスプライトタイプ %kind=spritekind に設定する || (幅: %width , 高さ: %height, オフセット: %offset)"
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% width.defl=20
    //% height.defl=4
    //% offset.defl=4
    //% group="HPステータスバー"
    //% weight=93
    export function setHPStatusBarToSpriteKind(kind: number, width: number = 20, height: number = 4, offset: number = 4) {
        const allSprites = sprites.allOfKind(kind)
        for (let i = 0; i < allSprites.length; i++) {
            const sprite = allSprites[i]
            let statusbar = statusbars.create(width, height, StatusBarKind.Health)
            statusbar.attachToSprite(sprite)
            statusbar.setOffsetPadding(0, offset)
        }
    }

    /**
     * スプライトのHPステータスバーの値を変える
     */
    //% block="スプライト%sprite=variables_get(mySprite) のHPステータスバーの値を%value だけ変える"
    //% value.defl=-10
    //% group="HPステータスバー"
    //% weight=92
    export function changeHPStatusBarValue(sprite: Sprite, value: number = -10) {
        let statusbar = statusbars.getStatusBarAttachedTo(StatusBarKind.Health, sprite)
        if (statusbar) {
            if (value > 0) {
                statusbar.value = Math.min(100, statusbar.value + value)
            } else {
                statusbar.value = Math.max(0, statusbar.value + value)
            }
        }
    }

    /**
     * HPステータスバーがゼロになったとき
     */
    //% block="HPステータスバーがゼロになったとき"
    //% draggableParameters="reporter"
    //% group="HPステータスバー"
    //% weight=91
    export function onHPStatusBarZero(handler: (sprite: Sprite, kind: number) => void) {
        const dataKey = `${stateNamespace}_on_hp_zero`
        let handlers = game.currentScene().data[dataKey] as ((sprite: Sprite, spriteKind: number) => void)[]
        if (!handlers) {
            handlers = game.currentScene().data[dataKey] = [] as ((sprite: Sprite, spriteKind: number) => void)[]
        }
        handlers.push(handler)
    }

    statusbars.onZero(StatusBarKind.Health, (statusbar: StatusBarSprite) => {
        const dataKey = `${stateNamespace}_on_hp_zero`
        const handlers = (game.currentScene().data[dataKey] || []) as ((sprite: Sprite, spriteKind: number) => void)[]
        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i]
            const sprite = statusbar.spriteAttachedTo()
            handler(sprite, sprite.kind());
        }
    })

    function alignItems(items: Sprite[]) {
        const itemLeft = info.hasLife() ? Math.round(32 + (Math.log(info.life()) / Math.log(10) + 1) * 5) : 8
        let x = itemLeft
        let y = 8
        const scale = 0.6
        const gap = 6
        items.forEach((item) => {
            item.setPosition(x, y)
            item.setScale(scale, ScaleAnchor.Middle)
            item.setFlag(SpriteFlag.RelativeToCamera, true)
            x += item.width * scale + gap
            if (x > screen.width * 0.85) {
                x = itemLeft
                y += 12
            }
        })
    }

    /**
     * スプライトにアイテムを追加する
     */
    //% block="スプライト%sprite=variables_get(mySprite) にアイテム%item=variables_get(item)を追加する"
    //% group="アイテム管理"
    //% weight=89
    export function addItemToSprite(sprite: Sprite, item: Sprite) {
        if (!sprite || !item) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) {
            spriteDicts = game.currentScene().data[dataKey] = {}
        }
        let data = spriteDicts[sprite.id] as SpriteDungeonPackData | undefined
        if (data) {
            if (data.items && data.items.indexOf(item) < 0) {
                data.items.push(item)
            } else {
                data.items = [item]
            }
        } else {
            data = {
                sprite: sprite,
                items: [item]
            }
        }
        spriteDicts[sprite.id] = data

        let handlers = game.currentScene().data[`${stateNamespace}_handlers`] as AnimationHandlers
        if (!handlers || !handlers.itemHandlerRegistered) {
            if (!handlers) handlers = { itemHandlerRegistered: true }
            else handlers.itemHandlerRegistered = true

            game.eventContext().registerFrameHandler(scene.ANIMATION_UPDATE_PRIORITY, () => {
                alignItems(data.items);
            })
        }
        game.currentScene().data[`${stateNamespace}_handlers`] = handlers
    }


    /**
     * スプライトにアイテムがアイテムを保持しているかチェックする (Spriteでチェックする)
     */
    //% block="スプライト%sprite=variables_get(mySprite) が%item=variables_get(item) をアイテムとして保持している"
    //% group="アイテム管理"
    //% weight=88
    export function spriteHasSpriteItem(sprite: Sprite, itemSprite: Sprite): boolean {
        if (!sprite || !itemSprite) return false;

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) return false
        let data = spriteDicts[sprite.id] as SpriteDungeonPackData
        if (!data || !data.items) return false

        let hasItem = false
        data.items.forEach((item: Sprite) => {
            if (item === itemSprite) hasItem = true
        })
        return hasItem
    }


    /**
     * スプライトがアイテムを保持しているかチェックする (kindでチェックする)
     */
    //% block="スプライト%sprite=variables_get(mySprite) が%kind=spritekind タイプのアイテムを保持している"
    //% group="アイテム管理"
    //% weight=87
    export function spriteHasItem(sprite: Sprite, kind: number): boolean {
        if (!sprite) return false;

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) return false
        let data = spriteDicts[sprite.id] as SpriteDungeonPackData
        if (!data || !data.items) return false

        let hasItem = false
        data.items.forEach((item: Sprite) => {
            if (item.kind() === kind) hasItem = true
        })
        return hasItem
    }


    /**
     * スプライトの保持アイテムからアイテムを削除する (Sprite指定)
     */
    //% block="スプライト%sprite=variables_get(mySprite) の保持アイテムからアイテム%itemSprite=variables_get(item) を削除する"
    //% group="アイテム管理"
    //% weight=86
    export function deleteItemSprite(sprite: Sprite, itemSprite: Sprite): void {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) return
        let data = spriteDicts[sprite.id] as SpriteDungeonPackData
        if (!data || !data.items) return

        const deleteIndex: number[] = [];
        data.items.forEach((item: Sprite, index: number) => {
            if (item === itemSprite) {
                item.destroy()
                deleteIndex.push(index)
            }
        })
        deleteIndex.reverse()
        for (const i of deleteIndex) {
            data.items.splice(i, 1)
        }
        spriteDicts[sprite.id] = data
    }


    /**
     * スプライトの保持アイテムからアイテムを削除する (kind指定)
     */
    //% block="スプライト%sprite=variables_get(mySprite) の保持アイテムから%kind=spritekind タイプのアイテムを削除する"
    //% group="アイテム管理"
    //% weight=85
    export function deleteItem(sprite: Sprite, kind: number): void {
        if (!sprite) return

        const dataKey = stateNamespace

        let spriteDicts = game.currentScene().data[dataKey]
        if (!spriteDicts) return
        let data = spriteDicts[sprite.id] as SpriteDungeonPackData
        if (!data || !data.items) return

        const deleteIndex: number[] = [];
        data.items.forEach((item: Sprite, index: number) => {
            if (item.kind() === kind) {
                item.destroy()
                deleteIndex.push(index)
            }
        })
        deleteIndex.reverse()
        for (const i of deleteIndex) {
            data.items.splice(i, 1)
        }

        alignItems(data.items)
        spriteDicts[sprite.id] = data
    }


    /**
     * スプライトの上下左右のタイルの位置を取得する
     */
    //% block="スプライト%sprite=variables_get(mySprite) の%direction方向のタイルの位置"
    //% group="タイルマップ"
    //% weight=70
    export function getTileAt(sprite: Sprite, direction: CollisionDirection): tiles.Location {
        const tileMap = game.currentScene().tileMap
        const loc = sprite.tilemapLocation()
        const col = loc.col + (direction === CollisionDirection.Left ? -1 : (direction === CollisionDirection.Right ? 1 : 0))
        const row = loc.row + (direction === CollisionDirection.Top ? -1 : (direction === CollisionDirection.Bottom ? 1 : 0))
        return new tiles.Location(col, row, tileMap)
    }
}
