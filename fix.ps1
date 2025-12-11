$content = Get-Content -Raw index.html
$start = '<div class="scroll_message">'
$end = '</div>`r`n         </section>'
$startIndex = $content.IndexOf($start)
$endIndex = $content.IndexOf($end, $startIndex)
if($startIndex -lt 0 -or $endIndex -lt 0){Write-Error "markers not found"; exit 1}
$prefix = $content.Substring(0,$startIndex)
$suffix = $content.Substring($endIndex + $end.Length)
$newBlock = @"
            <div class="scroll_message">
                <div class="scroll_message_left">
                    <p>ハイスペックPC × 全席個室　快適ネット＆ゲーム空間　周りを気にせず思いっきり楽しめる。</p>
                </div>
                <div class="scroll_message_right">
                    <p>ハイスペックPC完備　個室あり　多席個室あり　喫煙ルームあり　シャワー利用可　フード＆ドリンク提供</p>
                </div>
            </div>
         </section>
"@
($prefix + $newBlock + $suffix) | Set-Content index.html
