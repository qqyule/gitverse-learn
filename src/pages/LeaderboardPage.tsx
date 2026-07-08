import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'

interface LeaderboardRow {
	accuracy: number
	completed: number
	timeSec: number
	user: string
}

// 本地 mock 数据；真实聚合依赖 M3 的 Supabase 服务端函数（见 progressSync / accountStore）。
const MOCK_LEADERBOARD: LeaderboardRow[] = [
	{ accuracy: 0.98, completed: 12, timeSec: 1820, user: 'alice' },
	{ accuracy: 0.95, completed: 12, timeSec: 2110, user: 'bob' },
	{ accuracy: 0.93, completed: 11, timeSec: 1980, user: 'carol' },
	{ accuracy: 0.9, completed: 10, timeSec: 2450, user: 'dave' },
	{ accuracy: 0.88, completed: 9, timeSec: 2760, user: 'erin' },
]

const formatTime = (sec: number): string => {
	const minutes = Math.floor(sec / 60)
	const seconds = sec % 60
	return `${minutes}m ${seconds}s`
}

const LeaderboardPage = () => {
	const { t } = useTranslation()
	return (
		<div className="container mx-auto max-w-3xl py-12">
			<Card>
				<CardHeader>
					<CardTitle>{t('leaderboard.title')}</CardTitle>
					<CardDescription>{t('leaderboard.description')}</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>#</TableHead>
								<TableHead>{t('leaderboard.user')}</TableHead>
								<TableHead>{t('leaderboard.completed')}</TableHead>
								<TableHead>{t('leaderboard.time')}</TableHead>
								<TableHead>{t('leaderboard.accuracy')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{MOCK_LEADERBOARD.map((row, index) => (
								<TableRow key={row.user}>
									<TableCell>{index + 1}</TableCell>
									<TableCell className="font-medium">{row.user}</TableCell>
									<TableCell>{row.completed}</TableCell>
									<TableCell>{formatTime(row.timeSec)}</TableCell>
									<TableCell>{Math.round(row.accuracy * 100)}%</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
					<p className="mt-4 text-muted-foreground text-xs">{t('leaderboard.soonNote')}</p>
				</CardContent>
			</Card>
		</div>
	)
}

export default LeaderboardPage
