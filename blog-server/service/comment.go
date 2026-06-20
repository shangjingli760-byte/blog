// 评论业务逻辑层
package service

import (
	"blog-server/model"
	"blog-server/repository"
	"errors"
	"regexp"
	"strconv"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

type CommentService struct {
	repo *repository.CommentRepository
}

func NewCommentService(repo *repository.CommentRepository) *CommentService {
	return &CommentService{repo: repo}
}

// 获取文章评论
func (s *CommentService) GetComments(articleID uint) ([]model.Comment, error) {
	return s.repo.FindByArticleID(articleID)
}

// 创建评论，校验邮箱格式
func (s *CommentService) CreateComment(comment *model.Comment) error {
	if comment.Nickname == "" || comment.Email == "" || comment.Content == "" {
		return errors.New("昵称、邮箱、内容不能为空")
	}
	if !emailRegex.MatchString(comment.Email) {
		return errors.New("邮箱格式不正确")
	}
	return s.repo.Create(comment)
}

// 删除评论
func (s *CommentService) DeleteComment(id string) error {
	idUint, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		return errors.New("评论 ID 格式错误")
	}
	return s.repo.Delete(uint(idUint))
}
