# ============================================
# 临时修复脚本（PowerShell）
# ============================================
# 用途：对 `index.html` 中指定标记区间进行一次性替换（字符串切片拼接）。
# 注意：
# - 该脚本属于“历史维护工具”，仅在需要批量替换旧区块时使用。
# - `$start` / `$end` 是脆弱的字符串锚点；页面结构变动后可能匹配失败（脚本会退出并提示）。
# - `$newBlock` 内含非 UTF-8 的历史文本（显示为乱码属于预期），如需再次使用建议先统一编码。
# - 不建议在日常开发流程中依赖此脚本；优先在编辑器中直接维护源文件。

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
                    <p>�ϥ����ڥå�PC �� ȫϯ���ҡ����m�ͥåȣ����`����g���ܤ��ݤˤ���˼���ä���S����롣</p>
                </div>
                <div class="scroll_message_right">
                    <p>�ϥ����ڥå�PC��䡡���Ҥ��ꡡ��ϯ���Ҥ��ꡡ�˟���`�ढ�ꡡ�����`���ÿɡ��թ`�ɣ��ɥ���ṩ</p>
                </div>
            </div>
         </section>
"@
($prefix + $newBlock + $suffix) | Set-Content index.html
