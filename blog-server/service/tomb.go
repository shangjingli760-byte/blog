// 墓碑业务逻辑层
package service

import (
	"blog-server/model"
	"blog-server/repository"
	"errors"
	"strconv"
)

type TombService struct {
	repo *repository.TombRepository
}

func NewTombService(repo *repository.TombRepository) *TombService {
	return &TombService{repo: repo}
}

// 获取墓碑列表
func (s *TombService) GetTombs() ([]model.Tomb, error) {
	return s.repo.FindAll()
}

// 获取墓碑详情
func (s *TombService) GetTombByID(id string) (*model.Tomb, error) {
	idUint, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return nil, errors.New("墓碑 ID 格式错误")
	}
	return s.repo.FindByID(uint(idUint))
}

// 创建墓碑
func (s *TombService) CreateTomb(tomb *model.Tomb) error {
	if tomb.Name == "" || tomb.Reason == "" || tomb.BuilderName == "" {
		return errors.New("名字、原因、立碑人不能为空")
	}
	return s.repo.Create(tomb)
}

// 删除墓碑（同时删除关联的扫墓记录和来访者记录）
func (s *TombService) DeleteTomb(id string) error {
	idUint, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return errors.New("墓碑 ID 格式错误")
	}
	uid := uint(idUint)
	// 先删除关联数据
	s.repo.DeleteVisitsByTombID(uid)
	s.repo.DeleteVisitorsByTombID(uid)
	return s.repo.Delete(uid)
}

// ---- 扫墓 ----

// 获取扫墓记录
func (s *TombService) GetVisits(tombID string) ([]model.TombVisit, error) {
	idUint, err := strconv.ParseUint(tombID, 10, 64)
	if err != nil {
		return nil, errors.New("墓碑 ID 格式错误")
	}
	return s.repo.FindVisitsByTombID(uint(idUint))
}

// 扫墓（创建扫墓记录）
func (s *TombService) CreateVisit(visit *model.TombVisit) error {
	if visit.Visitor == "" {
		return errors.New("扫墓者名字不能为空")
	}
	return s.repo.CreateVisit(visit)
}

// ---- 来访者 ----

// 记录来访者
func (s *TombService) RecordVisitor(v *model.TombVisitor) error {
	if v.Visitor == "" {
		return errors.New("来访者名字不能为空")
	}
	return s.repo.CreateVisitor(v)
}

// 获取墓碑的来访者列表
func (s *TombService) GetVisitors(tombID string) ([]model.TombVisitor, error) {
	idUint, err := strconv.ParseUint(tombID, 10, 64)
	if err != nil {
		return nil, errors.New("墓碑 ID 格式错误")
	}
	return s.repo.FindVisitorsByTombID(uint(idUint))
}

// 获取墓碑统计信息：来访人数、扫墓人数、只看不扫人数
func (s *TombService) GetTombStats(tombID string) (map[string]int, error) {
	idUint, err := strconv.ParseUint(tombID, 10, 64)
	if err != nil {
		return nil, errors.New("墓碑 ID 格式错误")
	}
	uid := uint(idUint)

	visitors, err := s.repo.FindVisitorsByTombID(uid)
	if err != nil {
		return nil, err
	}
	visits, err := s.repo.FindVisitsByTombID(uid)
	if err != nil {
		return nil, err
	}

	// 扫墓者去重集合
	sweptSet := make(map[string]bool)
	for _, v := range visits {
		sweptSet[v.Visitor] = true
	}

	// 来访者去重集合
	visitedSet := make(map[string]bool)
	for _, v := range visitors {
		visitedSet[v.Visitor] = true
	}

	// 只看不扫 = 来访者中没扫墓的
	notSwept := 0
	for name := range visitedSet {
		if !sweptSet[name] {
			notSwept++
		}
	}

	return map[string]int{
		"visitor_count":  len(visitedSet),
		"sweep_count":    len(sweptSet),
		"not_sweep_count": notSwept,
	}, nil
}
