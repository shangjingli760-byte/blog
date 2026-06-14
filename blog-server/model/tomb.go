// 赛博墓碑数据模型
package model

import "time"

// Tomb 墓碑表：记录被放鸽子的朋友
type Tomb struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:100;not null" json:"name"`             // 被纪念者名字
	Reason      string    `gorm:"size:500;not null" json:"reason"`           // 放鸽子原因
	Epitaph     string    `gorm:"type:text" json:"epitaph"`                  // 墓志铭
	BuilderName string    `gorm:"size:100;not null" json:"builder_name"`     // 立碑人昵称
	CreatedAt   time.Time `json:"created_at"`
}

// TombVisit 扫墓记录表：记录每次扫墓
type TombVisit struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TombID    uint      `gorm:"index;not null" json:"tomb_id"`              // 关联墓碑ID
	Visitor   string    `gorm:"size:100;not null" json:"visitor"`           // 扫墓者昵称
	Message   string    `gorm:"type:text" json:"message"`                   // 扫墓留言
	CreatedAt time.Time `json:"created_at"`
}

// TombVisitor 墓碑来访者记录：记录所有访问过墓碑页面的人
type TombVisitor struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TombID    uint      `gorm:"index;not null" json:"tomb_id"`              // 关联墓碑ID
	Visitor   string    `gorm:"size:100;not null" json:"visitor"`           // 来访者昵称
	CreatedAt time.Time `json:"created_at"`
}
