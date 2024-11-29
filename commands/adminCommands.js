export const adminCommands = {
    'HELP': '显示所有管理员命令的帮助信息',
    'ADDROOM': '添加房间到白名单',
    'REMOVEROOM': '从白名单中移除房间',
    'LISTROOMS': '显示所有白名单房间'
}

export async function handleAdminCommand(msg, action, targetId) {
    const formatHelpMessage = () => {
        const lines = ['管理员命令列表：']
        for (const [cmd, desc] of Object.entries(adminCommands)) {
            lines.push(`/ADMIN ${cmd}: ${desc}`)
        }
        return lines.join('\n')
    }

    switch (action) {
        case 'HELP':
            msg.say(formatHelpMessage())
            break

        case 'ADDROOM':
            if (targetId) {
                if (addRoomToWhitelist(targetId)) {
                    msg.say('房间已添加到白名单')
                } else {
                    msg.say('房间已在白名单中或添加失败')
                }
            } else {
                msg.say('请提供房间ID\n使用方式: /ADMIN ADDROOM')
            }
            break

        case 'REMOVEROOM':
            if (targetId) {
                if (removeRoomFromWhitelist(targetId)) {
                    msg.say('房间已从白名单移除')
                } else {
                    msg.say('房间不在白名单中或移除失败')
                }
            } else {
                msg.say('请提供房间ID\n使用方式: /ADMIN REMOVEROOM')
            }
            break

        case 'LISTROOMS':
            const rooms = loadWhitelistRooms()
            if (rooms.length > 0) {
                msg.say(`当前白名单房间:\n${rooms.join('\n')}`)
            } else {
                msg.say('当前白名单为空')
            }
            break

        default:
            msg.say(`未知的管理员命令\n${formatHelpMessage()}`)
    }
}
