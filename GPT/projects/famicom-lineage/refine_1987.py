"""1987年までに絞り、明示した機構の系譜と比較上の仮配置を補う。"""
from collections import Counter
import json
from pathlib import Path
import build_dataset

HERE=Path(__file__).resolve().parent

def build():
    build_dataset.build()
    data=json.loads((HERE/'dataset.json').read_text(encoding='utf-8'))
    nodes={n['id']:n for n in data['nodes'] if n['external'] or n['year']<=1987}
    edges=[e for e in data['edges'] if e['source'] in nodes and e['target'] in nodes]
    fc=[n for n in nodes.values() if not n['external']]
    def find(title):
        key=build_dataset.normal(title)
        exact=[n['id'] for n in nodes.values() if build_dataset.normal(n['title'])==key]
        if exact:return min(exact,key=lambda i:(nodes[i]['external'],nodes[i]['date']))
        matches=[n['id'] for n in nodes.values() if build_dataset.normal(n['title']).startswith(key)]
        if not matches:raise ValueError(title)
        return min(matches,key=lambda i:(nodes[i]['external'],nodes[i]['date']))
    def reference(title,year,platform='AC',group=7,note=None):
        match=next((n['id'] for n in nodes.values() if n['external'] and n['title']==title),None)
        if match:return match
        ident=f'q{len(nodes):04}'
        nodes[ident]=dict(id=ident,title=title,date=f'{year:04}-01-01',year=year,original_year=year,external=True,platform=platform,group=group,releases=[])
        if note:nodes[ident]['reference_note']=note
        return ident
    def add(a,b,why,kind='inferred',sequel=False,replace=False,tentative=False,sources=None):
        if replace:edges[:]=[e for e in edges if e['target']!=b]
        if any(e['target']==b for e in edges):return
        assert a!=b and nodes[a]['year']<=nodes[b]['year'],(a,b)
        edges.append(dict(source=a,target=b,reason=why,kind=kind,sequel=sequel,display=True,sources=sources or [],tentative=tentative))
    def link(a,b,why,kind='inferred',sequel=False,replace=False):add(find(a),find(b),why,kind,sequel,replace)
    # ユーザーが指摘した系統。ヘクターはキャラバン三部作の流れとしてつなぐ。
    link('スターフォース','スターソルジャー','スターフォースのFC版に続くハドソンのキャラバン系統。連射とスコア競争の継承。','lineage',False,True)
    link('スターソルジャー','ヘクター’87','スターフォース→スターソルジャーに続く第3回キャラバン作品。対地・対空攻撃と時間制競技の展開。','lineage',True)
    edges[-1]['sources']=['https://game.watch.impress.co.jp/docs/kikaku/1516378.html']
    invader=reference('スペースインベーダー',1978,'AC',2)
    add(invader,find('スペースインベーダー'),'1978年のアーケード原作から国内FC版への移植。原作と移植を分けて年代を保持。','lineage')
    shooter=[
        ('ゼビウス','アーガス','縦スクロールの対空・対地攻撃を、自機の高度と着陸へ展開。'),
        ('ゼビウス','Bーウイング','縦スクロールと地形を背景に、自機の武装を着脱する構造へ展開。'),
        ('ムーンクレスタ','テラクレスタ','合体する自機を縦スクロールと分離フォーメーション攻撃へ発展。'),
        ('ゼビウス','ジャイロダイン','ヘリコプターの対空・対地攻撃と地上目標を扱う縦スクロール。'),
        ('ゼビウス','ASO','対空・対地射撃を、装備とアーマーの管理へ展開。'),
        ('スクランブル','バルトロン','横スクロールの地形・空中敵・地上目標を組み合わせる。'),
        ('スクランブル','マグマックス','横スクロールの地形と地上・地下、機体の合体。'),
        ('スクランブル','スクーン','横スクロールと地形を海中に置き換え、人員の救出を組み合わせる。'),
        ('グラディウス','セクションZ','横視点の地形攻略と射撃を、左右の射撃・区域の分岐へ展開。'),
        ('スペースハリアー','とびだせ大作戦','後方視点の疑似3D移動と障害物の回避を跳躍へ展開。'),
        ('スペースハリアー','アタックアニマル学園','後方視点の高速な前進と照準射撃。'),
        ('スターラスター','宇宙船コスモキャリア','宇宙空間の戦闘と移動先を選ぶ戦略。'),
        ('スターラスター','コスモジェネシス','宇宙の戦闘・航行を戦略的に組み合わせる。'),
        ('ザナック','ガルフォース','縦スクロールの射撃と武器の選択を拡張。'),
        ('スターフォース','キングスナイト','縦スクロールの地形と射撃をキャラクターの育成・交代へ置き換える。'),
        ('ザクソン','JJ (ジェイジェイ)','奥行きを持つ射撃と障害物回避。'),
        ('グラディウス','エアーフォートレス','横スクロールの航空戦と、区域内での人物の探索を組み合わせる。'),
        ('グラディウス','パルサーの光','横スクロールの地形・敵編成と射撃。'),
        ('スカイデストロイヤー','ファルシオン','後方視点の自機と奥から迫る敵・障害物を扱う。'),
    ]
    reference('ムーンクレスタ',1980,'AC',2)
    reference('スペースハリアー',1985,'AC',4)
    reference('ザクソン',1982,'AC',4)
    for a,b,why in shooter:link(a,b,why,'lineage' if b=='テラクレスタ' else 'inferred',b=='テラクレスタ')
    add(reference('クレイジークライマー',1980,'AC',0),find('クレイジークライマー'),'アーケード原作からFCへの移植。','lineage')
    manual=[
        
        ('忍者くん 魔城','影の伝説','跳躍と飛び道具を使って画面の敵を倒す忍者アクション。'),
        ('忍者じゃじゃ丸','忍者ハットリ','横視点の跳躍と飛び道具による忍者アクション。'),
        ('スパルタンX','六三四の剣','横視点で相手との間合いを見て近接攻撃する。'),
        ('スパルタンX','グリーンベレー','横視点の近接攻撃と敵配置を、軍事的なステージへ展開。'),
        ('フロントライン','戦場の狼','見下ろしの人物射撃と地上の敵・障害物を扱う。'),
        ('戦場の狼','新人類','見下ろしの人物による連続射撃と地形の攻略。'),
        ('ロードランナー','ソロモンの鍵','固定画面で地形と移動経路を変えながら出口を目指す。'),
        ('倉庫番','涙の倉庫番','箱を押す経路の計画と、やり直せない配置を扱うパズル。'),
        ('ワイルドガンマン','マグナム危機一髪','敵の出現に反応する照準射撃。'),
        ('ザ・ビッグプロレスリング','タッグチーム','リングで近接技と投げ技を使うレスリング。'),
        ('タッグチーム','プロレス','リングで近接技と投げ技を使うレスリングの家庭用展開。'),
        ('ピットフォール!','スーパーピットフォール','原作シリーズを横視点のスクロール探索へ展開。'),
        ('メトロイド','スペースハンター','能力・装備と区域間の往復を使う横視点の探索。'),
        ('メトロイド','光神話 パルテナ','横視点の跳躍・射撃と縦方向の足場攻略。'),
        ('ドルアーガの塔','魔界島','見下ろしの戦闘と道具・区域を使った探索。'),
        ('スーパーマリオブラザーズ','迷宮組曲','横視点の跳躍と射撃に、部屋を行き来する探索を加える。'),
        ('悪魔城ドラキュラ','月風魔伝','横視点の剣と補助武器による戦闘を複数の区域へ展開。'),
        ('悪魔城ドラキュラ','チェスターフィールド','横視点の戦闘と探索・成長を組み合わせる。'),
        ('悪魔城ドラキュラ','マドゥーラの翼','横視点の武器攻撃と足場・アイテムの探索。'),
        ('魔界村','アテナ','横スクロールで敵と地形を攻略し、装備を扱う。'),
        ('ポートピア連続殺人事件','ミシシッピー','場所移動・聞き込み・調査による殺人事件の捜査。'),
        ('ポートピア連続殺人事件','消えたプリンセス','場所移動とコマンド選択による事件の捜査。'),
        ('ポートピア連続殺人事件','Law of the West','会話の選択で人物の反応と結果を変える。'),
        ('スパルタンX','アーバンチャンピオン','横視点の一対一の打撃戦を比較上の接続として置く。'),
        ('ハイパーオリンピック','ウインターゲームズ','複数競技のタイミング入力と記録への挑戦。'),
        ('ハイパーオリンピック','ファミリージョッキー','競技の操作と障害物・体力の管理。'),
        ('ハイパーオリンピック','ファミリーボクシング','相手の動作とタイミングに応じた打撃・防御。'),
        ('ゴルフ','プロゴルファー猿','ショットの方向・強さとコース攻略。'),
        ('イーアルカンフー','キン肉マン キン肉星','近接攻撃と相手の動作を読む対戦アクション。'),
        ('マリオブラザーズ','ブービーキッズ','固定画面の敵を仕掛けにかけて倒す。'),
        ('パックマン','上海','盤面の残り要素と次の選択を計画するパズルとして、比較上の仮接続。'),
        ('スーパーマリオブラザーズ','高橋名人のBUG','足場を渡るアクションをブロックくずしと組み合わせる。'),
    ]
    # 表記差と原作初出を扱い、FC版の発売順が逆なら原作を比較元に分ける。
    def safe(a,b,why):
        ai,bi=find(a),find(b)
        if nodes[ai]['date']>=nodes[bi]['date'] and not nodes[ai]['external']:
            n=nodes[ai];ai=reference(n['title']+'（原作）',min(n['original_year'],nodes[bi]['year']),'AC',n['group'])
        add(ai,bi,why)
    for a,b,why in manual:
        safe(a,b,why)
    anchors={'RPG':'ドラゴンクエスト','アドベンチャー':'ポートピア連続殺人事件','アクション':'スーパーマリオブラザーズ','シューティング':'ゼビウス','スポーツ':'ハイパーオリンピック','レース':'F1レース','パズル':'ロードランナー','テーブル':'麻雀','シミュレーション':'ボコスカウォーズ','その他':'ファミリーベーシック'}
    for n in sorted(fc,key=lambda n:(n['date'],n['id'])):
        if any(e['target']==n['id'] for e in edges):continue
        row=n['releases'][0];genre=row['genre'];publisher=row['publisher']
        candidates=[a for a in fc if a['date']<n['date'] and a['releases'][0]['genre']==genre]
        same=[a for a in candidates if a['releases'][0]['publisher']==publisher]
        if same:source=max(same,key=lambda a:a['date'])['id'];basis='同社・同ジャンルの先行作品'
        elif genre in anchors:
            source=find(anchors[genre]);basis='同ジャンルの代表的な先行作品'
            if nodes[source]['date']>=n['date']:
                source=min(candidates,key=lambda a:a['date'])['id'] if candidates else None
        else:source=None;basis='操作や用途の近い先行作品'
        if source is None:
            title={'テーブル':'麻雀・五目並べ','その他':'家庭用コンピューター遊び','アクション':'スペースパニック','スポーツ':'ポン'}.get(genre,'ポン')
            source=reference(title,0 if genre in ['テーブル','その他'] else 1972,'盤上' if genre=='テーブル' else '参考',n['group'],'成立年不詳' if genre in ['テーブル','その他'] else None)
            basis='遊びの形式・操作の前史'
        add(source,n['id'],f'仮配置：{basis}として比較。{genre}の操作・画面・進行形式を近い系統へ置いたもので、直接の開発上の影響を断定しない。',tentative=True)
    connected={e[k] for e in edges for k in ['source','target']}
    nodes={i:n for i,n in nodes.items() if not n['external'] or i in connected}
    counts=Counter(e['target'] for e in edges)
    data.update(title='ファミコンの系譜 1983–1987',scope='国内FC・FDSの1987年末まで。同名移植・再発売を統合。比較上の仮配置を含む。',end_year=1987,nodes=list(nodes.values()),edges=edges)
    data['display_policy']['multiple_parent_exceptions']={i:{'max_parents':c,'reason':'重要な複数の影響を併記。'} for i,c in counts.items() if c>1}
    catalogue=json.loads((HERE/'catalogue.json').read_text(encoding='utf-8'))
    rows=[r for r in catalogue['rows'] if int(r['date'][:4])<=1987]
    data['stats']=dict(fc_count=len(fc),external_count=len(nodes)-len(fc),edge_count=len(edges),sequel_edge_count=sum(e['sequel'] for e in edges),
                       cartridge_rows=sum(r['platform']=='FC' for r in rows),disk_rows=sum(r['platform']=='FDS' for r in rows),
                       year_counts=dict(sorted(Counter(n['year'] for n in fc).items())),unconnected_count=sum(n['id'] not in connected for n in fc),
                       tentative_edge_count=sum(e.get('tentative',False) for e in edges))
    (HERE/'dataset.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(data['stats'],ensure_ascii=False))

if __name__=='__main__':build()
