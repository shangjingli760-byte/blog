// 墓碑数据访问层，封装 GORM 操作
package repository

import (
	"blog-server/model"

	"gorm.io/gorm"
)

type TombRepository struct {
	db *gorm.DB
}

func NewTombRepository(db *gorm.DB) *TombRepository {
	return &TombRepository{db: db}
}

// 获取所有墓碑（按创建时间倒序）
func (r *TombRepository) FindAll() ([]model.Tomb, error) {
	var tombs []model.Tomb
	err := r.db.Order("created_at DESC").Find(&tombs).Error
	return tombs, err
}

// 通过 ID 获取墓碑
func (r *TombRepository) FindByID(id uint) (*model.Tomb, error) {
	var tomb model.Tomb
	err := r.db.First(&tomb, id).Error
	if err != nil {
		return nil, err
	}
	return &tomb, nil
}

// 创建墓碑
func (r *TombRepository) Create(tomb *model.Tomb) error {
	return r.db.Create(tomb).Error
}

// 删除墓碑
func (r *TombRepository) Delete(id uint) error {
	return r.db.Delete(&model.Tomb{}, id).Error
}

// ---- 扫墓记录 ----

// 获取指定墓碑的扫墓记录
func (r *TombRepository) FindVisitsByTombID(tombID uint) ([]model.TombVisit, error) {
	var visits []model.TombVisit
	err := r.db.Where("tomb_id = ?", tombID).Order("created_at DESC").Find(&visits).Error
	return visits, err
}

// 创建扫墓记录
func (r *TombRepository) CreateVisit(visit *model.TombVisit) error {
	return r.db.Create(visit).Error
}

// 删除指定墓碑的所有扫墓记录
func (r *TombRepository) DeleteVisitsByTombID(tombID uint) error {
	return r.db.Where("tomb_id = ?", tombID).Delete(&model.TombVisit{}).Error
}

// ---- 来访者记录 ----

// 创建来访者记录
func (r *TombRepository) CreateVisitor(v *model.TombVisitor) error {
	return r.db.Create(v).Error
}

// 获取指定墓碑的来访者列表
func (r *TombRepository) FindVisitorsByTombID(tombID uint) ([]model.TombVisitor, error) {
	var visitors []model.TombVisitor
	err := r.db.Where("tomb_id = ?", tombID).Order("created_at DESC").Find(&visitors).Error
	return visitors, err
}

// 获取所有来访者
func (r *TombRepository) FindAllVisitors() ([]model.TombVisitor, error) {
	var visitors []model.TombVisitor
	err := r.db.Order("created_at DESC").Find(&visitors).Error
	return visitors, err
}

// 删除指定墓碑的所有来访者记录
func (r *TombRepository) DeleteVisitorsByTombID(tombID uint) error {
	return r.db.Where("tomb_id = ?", tombID).Delete(&model.TombVisitor{}).Error
}
