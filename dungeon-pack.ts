/**
 * ダンジョンスターターパック
 */
//% weight=150 color=#e67e22 icon="\uf3ed" block="ダンジョンスターターパック"
namespace dungeon_pack {
    /**
     * タイル上にスプライトを生成する
     */
    //% block="スプライト%sprite=screen_image_picker (%kind=spriteKind タイプ)をタイル%tile 上に生成する || (速度 vx:%vx , vy:%vy)"
    //% tile.shadow=tileset_tile_picker
    //% tile.decompileIndirectFixedInstances=true
    //% expandableArgumentMode="toggle"
    //% inlineInputMode=inline
    //% vx.defl=0
    //% vy.defl=0
    //% weight=97
    export function spawnSpritesOnTile(sprite: Image, kind: number, tile: Image, vx: number = 0, vy: number = 0) {
        tiles.getTilesByType(tile).forEach(tLoc => {
            const s = sprites.create(sprite, kind)
            tiles.placeOnTile(s, tLoc)
            // line below does not work correctly
            tiles.setTileAt(tLoc, img` `)
            s.setVelocity(vx, vy)
            s.setBounceOnWall(true)
        })
    }
}
